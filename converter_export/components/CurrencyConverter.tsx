import { useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { ArrowUpDown, TrendingUp, Globe, RefreshCw } from "lucide-react";

  // ─────────────────────────────────────────────────────────────────────────────
  // CurrencyConverter
  // Self-contained component. Uses static exchange rate data by default.
  // To use live rates, replace the `popularRates` / `exchangeHistory` arrays
  // with a fetch call to an exchange-rate API (e.g. exchangerate-api.com).
  // ─────────────────────────────────────────────────────────────────────────────

  export default function CurrencyConverter() {
    const [fromAmount, setFromAmount] = useState("100");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("EUR");
    const [convertedAmount, setConvertedAmount] = useState("85.42");

    const currencies = [
      { code: "USD", name: "US Dollar",        symbol: "$",   flag: "🇺🇸" },
      { code: "EUR", name: "Euro",             symbol: "€",   flag: "🇪🇺" },
      { code: "GBP", name: "British Pound",    symbol: "£",   flag: "🇬🇧" },
      { code: "JPY", name: "Japanese Yen",     symbol: "¥",   flag: "🇯🇵" },
      { code: "CAD", name: "Canadian Dollar",  symbol: "C$",  flag: "🇨🇦" },
      { code: "AUD", name: "Australian Dollar",symbol: "A$",  flag: "🇦🇺" },
      { code: "CHF", name: "Swiss Franc",      symbol: "CHF", flag: "🇨🇭" },
      { code: "CNY", name: "Chinese Yuan",     symbol: "¥",   flag: "🇨🇳" },
      { code: "INR", name: "Indian Rupee",     symbol: "₹",   flag: "🇮🇳" },
      { code: "BRL", name: "Brazilian Real",   symbol: "R$",  flag: "🇧🇷" },
    ];

    // Static rates — swap these for live API data as needed
    const popularRates = [
      { from: "USD", to: "EUR", rate: "0.8542", change: "-0.12%" },
      { from: "USD", to: "GBP", rate: "0.7834", change: "+0.05%" },
      { from: "USD", to: "JPY", rate: "149.25",  change: "+0.18%" },
      { from: "EUR", to: "GBP", rate: "0.8672", change: "+0.08%" },
    ];

    const exchangeHistory = [
      { date: "Today",       rate: "0.8542", change: "-0.12%" },
      { date: "Yesterday",   rate: "0.8552", change: "+0.03%" },
      { date: "1 Week Ago",  rate: "0.8498", change: "+0.25%" },
      { date: "1 Month Ago", rate: "0.8678", change: "-1.57%" },
    ];

    const handleSwapCurrencies = () => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Currency Converter</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get real-time exchange rates and convert currencies instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Converter */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpDown className="h-6 w-6 mr-2 text-orange-500" />
                  Currency Converter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-amount">Amount</Label>
                      <Input
                        id="from-amount"
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="from-currency">From</Label>
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger id="from-currency"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              <span>{c.flag} {c.code} — {c.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={handleSwapCurrencies}
                      className="rounded-full w-10 h-10 p-0">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="to-amount">Converted Amount</Label>
                      <Input id="to-amount" type="text" value={convertedAmount}
                        readOnly className="text-lg font-bold bg-gray-50" />
                    </div>
                    <div>
                      <Label htmlFor="to-currency">To</Label>
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger id="to-currency"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              <span>{c.flag} {c.code} — {c.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    1 {fromCurrency} = 0.8542 {toCurrency} · Updated 5 minutes ago
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Rates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                  Rate History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exchangeHistory.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.date}</span>
                      <div className="text-right">
                        <div className="font-semibold">{item.rate}</div>
                        <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-orange-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Exchange rates update multiple times daily</p>
                  <p>• International shipping costs may vary</p>
                  <p>• Check product availability in your region</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Rates */}
        <Card className="mb-12">
          <CardHeader><CardTitle>Popular Exchange Rates</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRates.map((rate, i) => (
                <div key={i} className="p-4 border rounded-lg text-center">
                  <div className="font-semibold text-lg mb-1">{rate.from}/{rate.to}</div>
                  <div className="text-2xl font-bold mb-1">{rate.rate}</div>
                  <div className={`text-sm ${rate.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {rate.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  