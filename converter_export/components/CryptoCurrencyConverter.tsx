import { useState, useEffect } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Badge } from "@/components/ui/badge";
  import {
    Coins, ArrowRight, RefreshCw, Wallet,
    AlertCircle, CheckCircle2, Loader2, Shield
  } from "lucide-react";

  // ─────────────────────────────────────────────────────────────────────────────
  // CryptoCurrencyConverter
  //
  // Required backend endpoints (see backend/cryptoRoutes.ts):
  //   GET  /api/crypto/prices         → CryptoRate[]
  //   GET  /api/user/balance          → UserBalance   (auth required)
  //   POST /api/user/credit-balance   → { message, amount }  (auth required)
  //
  // Props:
  //   isAuthenticated  boolean   — pass your auth state
  //   onSignInClick    () => void — called when unauthenticated user tries to convert
  // ─────────────────────────────────────────────────────────────────────────────

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
    status: "pending" | "processing" | "completed" | "failed";
  }

  interface UserBalance {
    availableBalance: string;
    pendingBalance: string;
  }

  interface Props {
    isAuthenticated: boolean;
    onSignInClick?: () => void;
  }

  // Simple toast shim — replace with your own toast library if preferred
  function useSimpleToast() {
    return {
      toast: ({ title, description }: { title: string; description: string; variant?: string }) => {
        alert(`${title}\n${description}`);
      },
    };
  }

  export default function CryptoCurrencyConverter({ isAuthenticated, onSignInClick }: Props) {
    const queryClient = useQueryClient();
    const { toast } = useSimpleToast();

    const [selectedCrypto, setSelectedCrypto] = useState("usdc");
    const [cryptoAmount, setCryptoAmount] = useState("");
    const [usdValue, setUsdValue] = useState(0);
    const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([
      { step: 1, title: "Verify Stablecoin",    description: "Confirm your stablecoin deposit",   status: "pending" },
      { step: 2, title: "Convert to USD",        description: "Exchange stablecoin for US Dollars", status: "pending" },
      { step: 3, title: "Add to Account Balance",description: "Credit funds to your account",       status: "pending" },
    ]);

    // Fetch live stablecoin prices from your backend
    const { data: cryptoRates = [] } = useQuery<CryptoRate[]>({
      queryKey: ["/api/crypto/prices"],
      refetchInterval: 60000,
    });

    // Fetch user balance (only when authenticated)
    const { data: userBalance } = useQuery<UserBalance>({
      queryKey: ["/api/user/balance"],
      enabled: isAuthenticated,
    });

    useEffect(() => {
      if (cryptoAmount && selectedCrypto) {
        const rate = cryptoRates.find((r) => r.symbol === selectedCrypto);
        setUsdValue(rate ? parseFloat(cryptoAmount) * rate.price_usd : 0);
      } else {
        setUsdValue(0);
      }
    }, [cryptoAmount, selectedCrypto, cryptoRates]);

    // Fee structure (3.7% total)
    const serviceFeeRate    = 0.030; // 3.0%
    const networkFeeRate    = 0.005; // 0.5%
    const complianceFeeRate = 0.002; // 0.2%
    const totalFeeRate      = serviceFeeRate + networkFeeRate + complianceFeeRate;

    const serviceFee    = usdValue * serviceFeeRate;
    const networkFee    = usdValue * networkFeeRate;
    const complianceFee = usdValue * complianceFeeRate;
    const totalFees     = usdValue * totalFeeRate;
    const finalAmount   = usdValue - totalFees;

    const conversionMutation = useMutation({
      mutationFn: async (data: { cryptoAmount: number; cryptoSymbol: string; usdValue: number }) => {
        const setStep = (n: number, status: ConversionStep["status"]) =>
          setConversionSteps((prev) => prev.map((s) => s.step === n ? { ...s, status } : s));

        setStep(1, "processing");
        await new Promise((r) => setTimeout(r, 2000));
        setStep(1, "completed");

        setStep(2, "processing");
        await new Promise((r) => setTimeout(r, 1500));
        setStep(2, "completed");

        setStep(3, "processing");
        const net = (data.usdValue * (1 - 0.037)).toFixed(2);

        const res = await fetch("/api/user/credit-balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            amount: net,
            description: `Crypto conversion — ${data.cryptoAmount} ${data.cryptoSymbol.toUpperCase()} to USD (after 3.7% fees)`,
            referenceType: "crypto_conversion",
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        setStep(3, "completed");
        return { ...data, net };
      },
      onSuccess: ({ net, usdValue }) => {
        toast({ title: "Conversion Successful!", description: `$${net} added to your account (fee: $${(usdValue * 0.037).toFixed(2)}).` });
        setCryptoAmount("");
        setUsdValue(0);
        setTimeout(() => setConversionSteps((prev) => prev.map((s) => ({ ...s, status: "pending" }))), 3000);
        queryClient.invalidateQueries({ queryKey: ["/api/user/balance"] });
      },
      onError: (err: any) => {
        toast({ title: "Conversion Failed", description: err.message || "Please try again.", variant: "destructive" });
        setConversionSteps((prev) => prev.map((s) => ({ ...s, status: "pending" })));
      },
    });

    const selectedRate = cryptoRates.find((r) => r.symbol === selectedCrypto);

    if (!isAuthenticated) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to use the cryptocurrency converter.</p>
          <Button onClick={onSignInClick}>Sign In</Button>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stablecoin Converter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert stablecoins to USD and credit your account balance. 3.7% total fee.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Conversion Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="h-6 w-6 mr-2 text-orange-500" />
                Convert Stablecoin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Select Stablecoin</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cryptoRates.map((c) => (
                        <SelectItem key={c.symbol} value={c.symbol}>
                          <span>{c.icon} {c.name} — ${c.price_usd.toLocaleString()}</span>
                          <span className={`ml-2 text-sm ${c.percent_change_24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {c.percent_change_24h >= 0 ? "+" : ""}{c.percent_change_24h.toFixed(2)}%
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount to Convert</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">{selectedRate?.icon}</span>
                    <Input type="number" placeholder="0.00" className="pl-10"
                      value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)}
                      step="0.00000001" min="0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    1 {selectedRate?.name} = ${selectedRate?.price_usd.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross USD:</span>
                    <span className="font-semibold">${usdValue.toFixed(2)}</span>
                  </div>
                  {usdValue > 0 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Service (3.0%):</span>
                        <span className="text-red-600">-${serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Network (0.5%):</span>
                        <span className="text-red-600">-${networkFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Compliance (0.2%):</span>
                        <span className="text-red-600">-${complianceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Total Fees (3.7%):</span>
                        <span className="text-red-600">-${totalFees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Net Amount:</span>
                        <span className="text-orange-500 text-xl">${finalAmount.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500">Minimum: $10.00 after fees</p>
                    </>
                  )}
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-3"
                  onClick={() => conversionMutation.mutate({ cryptoAmount: parseFloat(cryptoAmount), cryptoSymbol: selectedCrypto, usdValue })}
                  disabled={conversionMutation.isPending || !cryptoAmount || finalAmount < 10}>
                  {conversionMutation.isPending
                    ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Converting...</>
                    : <><ArrowRight className="h-5 w-5 mr-2" />Convert to Balance</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Balance + Steps */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Wallet className="h-5 w-5 mr-2 text-orange-500" />Account Balance</CardTitle></CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-1">
                  ${parseFloat(userBalance?.availableBalance || "0").toFixed(2)}
                </div>
                <p className="text-gray-600">Available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Pending: ${parseFloat(userBalance?.pendingBalance || "0").toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center"><Shield className="h-5 w-5 mr-2 text-orange-500" />Conversion Steps</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionSteps.map((step) => (
                    <div key={step.step} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === "completed"  ? "bg-green-100 text-green-600" :
                        step.status === "processing" ? "bg-orange-500 text-white" :
                        step.status === "failed"     ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {step.status === "completed"  ? <CheckCircle2 className="h-4 w-4" /> :
                         step.status === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> :
                         step.status === "failed"     ? <AlertCircle className="h-4 w-4" /> :
                         <span className="text-sm">{step.step}</span>}
                      </div>
                      <div>
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

        {/* Supported cryptos grid */}
        <Card>
          <CardHeader><CardTitle>Supported Stablecoins</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cryptoRates.map((c) => (
                <div key={c.symbol} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{c.icon}</span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <Badge variant={c.percent_change_24h >= 0 ? "default" : "destructive"}>
                      {c.percent_change_24h >= 0 ? "+" : ""}{c.percent_change_24h.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-orange-500">${c.price_usd.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  