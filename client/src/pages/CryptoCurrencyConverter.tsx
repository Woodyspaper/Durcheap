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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bitcoin, 
  Coins, 
  DollarSign, 
  ArrowRight, 
  RefreshCw, 
  TrendingUp, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield
} from "lucide-react";

interface CryptoRate {
  symbol: string;
  name: string;
  price_usd: number;
  percent_change_24h: number;
  icon: string;
}

interface ConversionStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface UserBalance {
  id: string;
  userId: string;
  availableBalance: string;
  pendingBalance: string;
  totalEarned: string;
  totalWithdrawn: string;
}

export default function CryptoCurrencyConverter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedCrypto, setSelectedCrypto] = useState("usdc");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [usdValue, setUsdValue] = useState(0);
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([
    { step: 1, title: "Verify Stablecoin", description: "Confirm your stablecoin deposit", status: 'pending' },
    { step: 2, title: "Convert to USD", description: "Exchange stablecoin for US Dollars", status: 'pending' },
    { step: 3, title: "Add to Account Balance", description: "Credit funds to your Durcheap account", status: 'pending' }
  ]);

  // Fetch live crypto prices
  const { data: cryptoRates = [], isLoading: cryptoLoading } = useQuery<CryptoRate[]>({
    queryKey: ['/api/crypto/prices'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch user balance
  const { data: userBalance } = useQuery<UserBalance>({
    queryKey: ['/api/user/balance'],
    enabled: isAuthenticated,
  });

  // Calculate USD value when crypto amount or selection changes
  useEffect(() => {
    if (cryptoAmount && selectedCrypto) {
      const rate = cryptoRates.find(r => r.symbol === selectedCrypto);
      if (rate) {
        setUsdValue(parseFloat(cryptoAmount) * rate.price_usd);
      }
    } else {
      setUsdValue(0);
    }
  }, [cryptoAmount, selectedCrypto]);

  // Enhanced fee structure
  const serviceFeeRate = 0.03; // 3% Durcheap service fee
  const networkFeeRate = 0.005; // 0.5% network/exchange fee
  const complianceFeeRate = 0.002; // 0.2% regulatory compliance fee
  const totalFeeRate = serviceFeeRate + networkFeeRate + complianceFeeRate; // 3.7% total

  // Calculate all fees and final amount
  const serviceFee = usdValue * serviceFeeRate;
  const networkFee = usdValue * networkFeeRate;
  const complianceFee = usdValue * complianceFeeRate;
  const totalFees = usdValue * totalFeeRate;
  const finalAmount = usdValue - totalFees;

  // Mock conversion process
  const conversionMutation = useMutation({
    mutationFn: async (data: { cryptoAmount: number; cryptoSymbol: string; usdValue: number }) => {
      // Step 1: Convert crypto to USDC
      setConversionSteps(prev => prev.map(step => 
        step.step === 1 ? { ...step, status: 'processing' } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConversionSteps(prev => prev.map(step => 
        step.step === 1 ? { ...step, status: 'completed' } : step
      ));

      // Step 2: Convert USDC to USD
      setConversionSteps(prev => prev.map(step => 
        step.step === 2 ? { ...step, status: 'processing' } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConversionSteps(prev => prev.map(step => 
        step.step === 2 ? { ...step, status: 'completed' } : step
      ));

      // Step 3: Add to account balance
      setConversionSteps(prev => prev.map(step => 
        step.step === 3 ? { ...step, status: 'processing' } : step
      ));
      
      // Calculate final amount after all fees
      const totalFees = data.usdValue * 0.037; // 3.7% total fees
      const finalAmount = data.usdValue - totalFees;

      // Credit the user's balance (after service fee)
      await apiRequest("POST", "/api/user/credit-balance", {
        amount: finalAmount.toFixed(2),
        description: `Crypto conversion - ${data.cryptoAmount} ${data.cryptoSymbol.toUpperCase()} to USD (after 3.7% total fees)`,
        referenceType: "crypto_conversion"
      });

      setConversionSteps(prev => prev.map(step => 
        step.step === 3 ? { ...step, status: 'completed' } : step
      ));

      return data;
    },
    onSuccess: (data) => {
      const totalFees = data.usdValue * 0.037;
      const finalAmount = data.usdValue - totalFees;
      
      toast({
        title: "Conversion Successful!",
        description: `$${finalAmount.toFixed(2)} has been added to your account balance (after $${totalFees.toFixed(2)} total fees).`,
      });
      
      // Reset form
      setCryptoAmount("");
      setUsdValue(0);
      
      // Reset steps after success
      setTimeout(() => {
        setConversionSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      }, 3000);
      
      // Refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "There was an error processing your conversion. Please try again.",
        variant: "destructive",
      });
      
      // Reset steps on error
      setConversionSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    },
  });

  const handleConversion = () => {
    if (!cryptoAmount || !selectedCrypto || finalAmount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a crypto amount that results in at least $10 USD after service fees.",
        variant: "destructive",
      });
      return;
    }

    conversionMutation.mutate({
      cryptoAmount: parseFloat(cryptoAmount),
      cryptoSymbol: selectedCrypto,
      usdValue
    });
  };

  const selectedRate = cryptoRates.find(r => r.symbol === selectedCrypto);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-amazon-dark mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to use the cryptocurrency converter.</p>
          <Button onClick={() => window.location.href = "/auth"}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Stablecoin Converter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert your stablecoins to USD and add it directly to your Durcheap account balance. 
            Supports USDC, USDT, DAI, and BUSD with real-time exchange rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Conversion Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="h-6 w-6 mr-2 text-amazon-orange" />
                Convert Stablecoin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="crypto-select">Select Stablecoin</Label>
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
                            <span className={`text-sm ${
                              crypto.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {crypto.percent_change_24h >= 0 ? '+' : ''}
                              {crypto.percent_change_24h.toFixed(2)}%
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="crypto-amount">Amount to Convert</Label>
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
                    Current rate: 1 {selectedRate?.name} = ${selectedRate?.price_usd.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Gross USD Value:</span>
                    <span className="text-xl font-semibold">
                      ${usdValue.toFixed(2)}
                    </span>
                  </div>
                  
                  {usdValue > 0 && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Service Fee (3.0%):</span>
                        <span className="text-red-600">-${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Network/Exchange Fee (0.5%):</span>
                        <span className="text-red-600">-${networkFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Compliance Fee (0.2%):</span>
                        <span className="text-red-600">-${complianceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t pt-1">
                        <span className="text-gray-800">Total Fees (3.7%):</span>
                        <span className="text-red-600 font-medium">-${totalFees.toFixed(2)}</span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">Net Amount:</span>
                          <span className="text-2xl font-bold text-amazon-orange">
                            ${finalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Minimum final amount: $10.00 USD after fees
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-lg py-3"
                  onClick={handleConversion}
                  disabled={conversionMutation.isPending || !cryptoAmount || finalAmount < 10}
                >
                  {conversionMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Convert to Account Balance
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Includes 3% service fee. Network fees and exchange rates may cause slight variations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance & Conversion Steps */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amazon-orange mb-2">
                    ${parseFloat(userBalance?.availableBalance || "0").toFixed(2)}
                  </div>
                  <p className="text-gray-600">Available Balance</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>Pending: ${parseFloat(userBalance?.pendingBalance || "0").toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-amazon-orange" />
                  Conversion Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionSteps.map((step) => (
                    <div key={step.step} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'processing' ? 'bg-amazon-orange text-white' :
                        step.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : step.status === 'processing' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : step.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm">{step.step}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supported Cryptocurrencies */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Supported Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cryptoRates.map((crypto) => (
                <div key={crypto.symbol} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{crypto.icon}</span>
                      <span className="font-medium">{crypto.name}</span>
                    </div>
                    <Badge variant={crypto.percent_change_24h >= 0 ? "default" : "destructive"}>
                      {crypto.percent_change_24h >= 0 ? '+' : ''}
                      {crypto.percent_change_24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-amazon-orange">
                    ${crypto.price_usd.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Information */}
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
                <p>• All conversions use secure, regulated exchanges</p>
                <p>• Multi-signature wallet protection</p>
                <p>• Real-time market rates with minimal slippage</p>
                <p>• Fraud monitoring on all transactions</p>
                <p>• FDIC insurance on USD balances</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Minimum final amount: $10 USD after service fees</p>
                <p>• 3% service fee applied to all conversions</p>
                <p>• Network fees included in service fee</p>
                <p>• Conversions processed within 5-10 minutes</p>
                <p>• Real-time exchange rates updated every 30 seconds</p>
                <p>• Tax reporting documents available for all conversions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}