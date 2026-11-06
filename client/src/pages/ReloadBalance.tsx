import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wallet, CreditCard, Smartphone, DollarSign, Gift, Shield, Loader2, Bitcoin, Coins } from "lucide-react";

interface UserBalance {
  id: string;
  userId: string;
  availableBalance: string;
  pendingBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
  createdAt: string;
  updatedAt: string;
}

interface BalanceTransaction {
  id: string;
  userId: string;
  type: string;
  amount: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter: string;
  status: string;
  createdAt: string;
}

interface CryptoRate {
  symbol: string;
  name: string;
  price_usd: number;
  percent_change_24h: number;
  icon: string;
}

export default function ReloadBalance() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [selectedCrypto, setSelectedCrypto] = useState("usdc");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoUsdValue, setCryptoUsdValue] = useState(0);
  const reloadAmounts = [25, 50, 100, 250, 500];
  const serviceFeeRate = 0.03; // 3% Durcheap service fee
  const networkFeeRate = 0.005; // 0.5% network/exchange fee
  const complianceFeeRate = 0.002; // 0.2% regulatory compliance fee
  const totalFeeRate = serviceFeeRate + networkFeeRate + complianceFeeRate; // 3.7% total

  // Crypto metadata with regulatory compliance
  const cryptoMetadata = [
    // Tier 1: Major cryptocurrencies (Globally compliant)
    { symbol: "bitcoin", name: "Bitcoin", icon: "₿", apiId: "bitcoin" },
    { symbol: "ethereum", name: "Ethereum", icon: "Ⱶ", apiId: "ethereum" },
    
    // Tier 2: Stablecoins (US/EU compliant)
    { symbol: "usdc", name: "USD Coin", icon: "$", apiId: "usd-coin" },
    { symbol: "usdt", name: "Tether", icon: "₮", apiId: "tether" },
    { symbol: "dai", name: "Dai", icon: "◈", apiId: "dai" },
    { symbol: "busd", name: "Binance USD", icon: "🟡", apiId: "binance-usd" },
    
    // Tier 3: Major altcoins (Most regions compliant)
    { symbol: "bnb", name: "BNB", icon: "🔥", apiId: "binancecoin" },
    { symbol: "xrp", name: "XRP", icon: "💧", apiId: "ripple" },
    { symbol: "cardano", name: "Cardano", icon: "₳", apiId: "cardano" },
    { symbol: "solana", name: "Solana", icon: "◎", apiId: "solana" },
    { symbol: "polygon", name: "Polygon", icon: "⬟", apiId: "matic-network" },
    { symbol: "chainlink", name: "Chainlink", icon: "🔗", apiId: "chainlink" },
    { symbol: "litecoin", name: "Litecoin", icon: "Ł", apiId: "litecoin" },
    
    // Tier 4: Regional compliance (Limited availability)
    { symbol: "avalanche", name: "Avalanche", icon: "🔺", apiId: "avalanche-2" },
    { symbol: "polkadot", name: "Polkadot", icon: "⚪", apiId: "polkadot" },
    { symbol: "algorand", name: "Algorand", icon: "▲", apiId: "algorand" },
    { symbol: "stellar", name: "Stellar", icon: "✦", apiId: "stellar" },
  ];

  // Fetch live crypto prices
  const { data: cryptoRates = [], isLoading: cryptoLoading } = useQuery<CryptoRate[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch user balance
  const { data: userBalance, isLoading: balanceLoading } = useQuery<UserBalance>({
    queryKey: ['/api/user/balance'],
    enabled: isAuthenticated,
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery<BalanceTransaction[]>({
    queryKey: ['/api/user/balance/transactions'],
    enabled: isAuthenticated,
  });

  // Calculate crypto USD value when crypto amount or selection changes
  useEffect(() => {
    if (cryptoAmount && selectedCrypto) {
      const rate = cryptoRates.find(r => r.symbol === selectedCrypto);
      if (rate) {
        setCryptoUsdValue(parseFloat(cryptoAmount) * rate.price_usd);
      }
    } else {
      setCryptoUsdValue(0);
    }
  }, [cryptoAmount, selectedCrypto]);

  // When switching to crypto payment with a pre-selected amount, calculate crypto equivalent
  useEffect(() => {
    if (paymentMethod === "crypto" && (selectedAmount || customAmount)) {
      const targetUsdAmount = selectedAmount || parseFloat(customAmount);
      if (targetUsdAmount && selectedCrypto) {
        const rate = cryptoRates.find(r => r.symbol === selectedCrypto);
        if (rate) {
          // Calculate required crypto amount (add fees to target amount)
          const totalWithFees = targetUsdAmount / (1 - totalFeeRate);
          const requiredCrypto = totalWithFees / rate.price_usd;
          setCryptoAmount(requiredCrypto.toFixed(8));
          setCryptoUsdValue(totalWithFees);
        }
      }
    }
  }, [paymentMethod, selectedAmount, customAmount, selectedCrypto]);

  // Reload balance mutation (handles both traditional and crypto payments)
  const reloadMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; cryptoData?: any }) => {
      if (data.method === "crypto") {
        // Crypto conversion process
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate crypto conversion
        
        const totalFees = data.cryptoData.usdValue * totalFeeRate;
        const finalAmount = data.cryptoData.usdValue - totalFees;
        
        await apiRequest("POST", "/api/user/credit-balance", {
          amount: finalAmount.toFixed(2),
          description: `Crypto conversion - ${data.cryptoData.cryptoAmount} ${data.cryptoData.cryptoSymbol.toUpperCase()} to USD (after 3.7% total fees)`,
          referenceType: "crypto_conversion"
        });
        
        return { success: true, amount: finalAmount, totalFees, method: "crypto" };
      } else {
        // Traditional payment processing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing
        
        await apiRequest("POST", "/api/user/credit-balance", {
          amount: data.amount.toFixed(2),
          description: `Balance reload - $${data.amount.toFixed(2)}`,
          referenceType: "reload"
        });
        
        return { success: true, amount: data.amount, method: "traditional" };
      }
    },
    onSuccess: (data) => {
      if (data.method === "crypto") {
        toast({
          title: "Crypto Conversion Successful!",
          description: `$${data.amount.toFixed(2)} has been added to your account (after $${data.totalFees?.toFixed(2)} total fees).`,
        });
      } else {
        toast({
          title: "Balance Reloaded Successfully!",
          description: `$${data.amount.toFixed(2)} has been added to your account.`,
        });
      }
      
      // Reset form
      setSelectedAmount(null);
      setCustomAmount("");
      setCryptoAmount("");
      setCryptoUsdValue(0);
      
      // Refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reload Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    
    // If crypto payment is selected, auto-calculate required crypto amount
    if (paymentMethod === "crypto" && selectedCrypto) {
      const rate = cryptoRates.find(r => r.symbol === selectedCrypto);
      if (rate) {
        const totalWithFees = amount / (1 - totalFeeRate);
        const requiredCrypto = totalWithFees / rate.price_usd;
        setCryptoAmount(requiredCrypto.toFixed(8));
        setCryptoUsdValue(totalWithFees);
      }
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    
    // If crypto payment is selected, auto-calculate required crypto amount
    if (paymentMethod === "crypto" && selectedCrypto && value) {
      const amount = parseFloat(value);
      if (amount > 0) {
        const rate = cryptoRates.find(r => r.symbol === selectedCrypto);
        if (rate) {
          const totalWithFees = amount / (1 - totalFeeRate);
          const requiredCrypto = totalWithFees / rate.price_usd;
          setCryptoAmount(requiredCrypto.toFixed(8));
          setCryptoUsdValue(totalWithFees);
        }
      }
    }
  };

  const handleReload = () => {
    if (paymentMethod === "crypto") {
      const totalFees = cryptoUsdValue * totalFeeRate;
      const finalAmount = cryptoUsdValue - totalFees;
      
      if (!cryptoAmount || !selectedCrypto || finalAmount < 10) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a crypto amount that results in at least $10 USD after all fees (3.7% total).",
          variant: "destructive",
        });
        return;
      }

      reloadMutation.mutate({
        amount: 0, // Not used for crypto
        method: "crypto",
        cryptoData: {
          cryptoAmount: parseFloat(cryptoAmount),
          cryptoSymbol: selectedCrypto,
          usdValue: cryptoUsdValue
        }
      });
    } else {
      const amount = selectedAmount || parseFloat(customAmount);
      
      if (!amount || amount < 10 || amount > 2000) {
        toast({
          title: "Invalid Amount",
          description: "Please enter an amount between $10 and $2,000.",
          variant: "destructive",
        });
        return;
      }

      reloadMutation.mutate({ amount, method: "traditional" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-amazon-dark mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to reload your balance.</p>
          <Button onClick={() => window.location.href = "/auth"}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }
  
  const paymentMethods = [
    {
      id: "credit_card",
      icon: CreditCard,
      title: "Credit/Debit Card",
      description: "Instant reload with any major credit or debit card"
    },
    {
      id: "mobile",
      icon: Smartphone,
      title: "Mobile Payment",
      description: "Use Apple Pay, Google Pay, or Samsung Pay"
    },
    {
      id: "crypto",
      icon: Bitcoin,
      title: "Cryptocurrency",
      description: "Convert crypto to USD (3.7% total fees apply)"
    },
    {
      id: "bank",
      icon: DollarSign,
      title: "Bank Transfer",
      description: "Direct transfer from your checking account"
    },
    {
      id: "gift",
      icon: Gift,
      title: "Gift Cards",
      description: "Redeem Durcheap gift cards to your balance"
    }
  ];

  const selectedRate = cryptoRates.find(r => r.symbol === selectedCrypto);
  const cryptoServiceFee = cryptoUsdValue * serviceFeeRate;
  const cryptoNetworkFee = cryptoUsdValue * networkFeeRate;
  const cryptoComplianceFee = cryptoUsdValue * complianceFeeRate;
  const cryptoTotalFees = cryptoUsdValue * totalFeeRate;
  const cryptoFinalAmount = cryptoUsdValue - cryptoTotalFees;

  const benefits = [
    "Instant checkout with stored balance",
    "No payment processing delays",
    "Track spending with balance history",
    "Secure encrypted transactions",
    "Auto-reload available for convenience",
    "Works across all Durcheap services"
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Reload Your Balance</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Add money to your Durcheap account for faster, more convenient shopping. Skip entering payment details at checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Reload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="h-6 w-6 mr-2 text-amazon-orange" />
                Add Money to Your Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount">Select Amount</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {reloadAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className={`h-12 text-lg ${
                          selectedAmount === amount 
                            ? "bg-amazon-orange hover:bg-amazon-orange/90 text-white" 
                            : "hover:bg-amazon-orange hover:text-white"
                        }`}
                        onClick={() => handleAmountSelect(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      min="10"
                      max="2000"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum $10, Maximum $2,000</p>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-4 w-4" />
                              <span>{method.title}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentMethods.find(m => m.id === paymentMethod)?.description}
                  </p>
                </div>

                {/* Cryptocurrency-specific fields */}
                {paymentMethod === "crypto" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center">
                        <Coins className="h-4 w-4 mr-2 text-amazon-orange" />
                        Cryptocurrency Details
                      </h4>
                      
                      <div>
                        <Label htmlFor="crypto-select">Select Cryptocurrency</Label>
                        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoRates.map((crypto) => (
                              <SelectItem key={crypto.symbol} value={crypto.symbol}>
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{crypto.icon}</span>
                                  <span>{crypto.name}</span>
                                  <span className="text-sm text-gray-500">
                                    ${crypto.price_usd.toLocaleString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="crypto-amount">Crypto Amount</Label>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                            {selectedRate?.icon}
                          </span>
                          <Input
                            id="crypto-amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-12"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                            step="0.00000001"
                            min="0"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Rate: 1 {selectedRate?.name} = ${selectedRate?.price_usd.toLocaleString()}
                        </p>
                      </div>

                      {cryptoUsdValue > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gross USD Value:</span>
                            <span className="font-medium">${cryptoUsdValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Service Fee (3.0%):</span>
                            <span className="text-red-600">-${cryptoServiceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Network/Exchange Fee (0.5%):</span>
                            <span className="text-red-600">-${cryptoNetworkFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Compliance Fee (0.2%):</span>
                            <span className="text-red-600">-${cryptoComplianceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-1">
                            <span className="text-gray-800">Total Fees (3.7%):</span>
                            <span className="text-red-600 font-medium">-${cryptoTotalFees.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-medium">
                              <span>Net Amount:</span>
                              <span className="text-amazon-orange">${cryptoFinalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button 
                  className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-lg py-3"
                  onClick={handleReload}
                  disabled={reloadMutation.isPending || (
                    paymentMethod === "crypto" 
                      ? (!cryptoAmount || cryptoFinalAmount < 10)
                      : (!selectedAmount && !customAmount)
                  )}
                >
                  {reloadMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add to Balance"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By clicking "Add to Balance", you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {balanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-amazon-orange" />
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-amazon-orange mb-2">
                        ${parseFloat(userBalance?.availableBalance || "0").toFixed(2)}
                      </div>
                      <p className="text-gray-600">Available Balance</p>
                      <div className="text-sm text-gray-500 mt-2">
                        <p>Pending: ${parseFloat(userBalance?.pendingBalance || "0").toFixed(2)}</p>
                        <p>Total Earned: ${parseFloat(userBalance?.totalEarned || "0").toFixed(2)}</p>
                      </div>
                      <Button variant="outline" className="mt-4" onClick={() => {
                        const transactionSection = document.getElementById('transaction-history');
                        if (transactionSection) {
                          transactionSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}>
                        View Transaction History
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-amazon-orange" />
                  Auto-Reload Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Enable Auto-Reload</span>
                    <button 
                      onClick={() => setAutoReloadEnabled(!autoReloadEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:ring-offset-2 ${
                        autoReloadEnabled ? 'bg-amazon-orange' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoReloadEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Automatically add $50 when balance falls below $10</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6 text-center">Available Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <Card 
                  key={method.id} 
                  className={`text-center hover:shadow-md transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-amazon-orange bg-orange-50' : ''
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <CardContent className="p-6">
                    <IconComponent className={`h-10 w-10 mx-auto mb-3 ${
                      isSelected ? 'text-amazon-orange' : 'text-gray-400'
                    }`} />
                    <h3 className={`font-semibold mb-2 ${
                      isSelected ? 'text-amazon-dark' : ''
                    }`}>{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    {method.id === "crypto" && (
                      <Badge variant="secondary" className="mt-2">
                        3.7% Total Fees
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Why Use Account Balance?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amazon-orange rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-amazon-orange" />
                Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• All transactions are encrypted with bank-level security</p>
                <p>• Your balance is protected by our Purchase Protection guarantee</p>
                <p>• Fraud monitoring on all account activity</p>
                <p>• Secure storage of payment information</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Reloads are processed instantly in most cases</p>
                <p>• Balance never expires and can be used anytime</p>
                <p>• Refunds return to original payment method when possible</p>
                <p>• Balance can be transferred to family accounts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div id="transaction-history" className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6">Recent Transactions</h2>
          <Card>
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amazon-orange" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="divide-y">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()} • 
                          Status: <span className="capitalize">{transaction.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Balance: ${parseFloat(transaction.balanceAfter).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet. Start by reloading your balance!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Cryptocurrency Regulatory Compliance & Fee Disclosure */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Bitcoin className="h-5 w-5 mr-2" />
              Cryptocurrency Regulatory Compliance & Fee Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regional Compliance */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Regional Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">✅ Tier 1: Global Compliance</h5>
                  <p className="text-gray-700">Bitcoin (BTC), Ethereum (ETH) - Available worldwide with local regulatory compliance</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">✅ Tier 2: US/EU Compliant</h5>
                  <p className="text-gray-700">USD Coin (USDC), Tether (USDT), Dai (DAI), Binance USD (BUSD) - Stablecoins approved in major markets</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">⚠️ Tier 3: Most Regions</h5>
                  <p className="text-gray-700">BNB, XRP, Cardano, Solana, Polygon, Chainlink, Litecoin - Subject to local restrictions</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🔍 Tier 4: Limited Availability</h5>
                  <p className="text-gray-700">Avalanche, Polkadot, Algorand, Stellar - May be restricted in certain jurisdictions</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Comprehensive Fee Structure */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Complete Fee Breakdown (3.7% Total)</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-orange-600 mb-2">Durcheap Service Fee: 3.0%</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Platform maintenance</li>
                      <li>• Customer support</li>
                      <li>• Account management</li>
                      <li>• Security infrastructure</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-orange-600 mb-2">Network/Exchange Fee: 0.5%</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Blockchain transaction costs</li>
                      <li>• Exchange processing fees</li>
                      <li>• Liquidity provider costs</li>
                      <li>• Gas fees coverage</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-orange-600 mb-2">Compliance Fee: 0.2%</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>• KYC/AML compliance</li>
                      <li>• Regulatory reporting</li>
                      <li>• Tax documentation</li>
                      <li>• Audit requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Regulatory Requirements */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Regulatory Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h5 className="font-medium mb-2">🇺🇸 United States</h5>
                  <p>Compliant with FinCEN, SEC, and CFTC regulations. Subject to Bank Secrecy Act and anti-money laundering requirements.</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🇪🇺 European Union</h5>
                  <p>Adheres to MiCA (Markets in Crypto-Assets) regulation and AMLD5 anti-money laundering directive.</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🇨🇦 Canada</h5>
                  <p>Regulated under FINTRAC and provincial securities commissions. MSB registration where required.</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🌏 Asia-Pacific</h5>
                  <p>Compliance varies by jurisdiction. Some cryptocurrencies may be restricted in certain countries.</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">⚠️ Important Disclaimers</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Cryptocurrency availability is subject to local laws and regulations</li>
                <li>• Exchange rates fluctuate continuously and final amounts may vary</li>
                <li>• Additional verification may be required for large transactions</li>
                <li>• Some regions may have transaction limits or restrictions</li>
                <li>• Tax implications vary by jurisdiction - consult a tax professional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}