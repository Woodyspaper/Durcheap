# Converter Components — Drop-In Package

  ## Files
  | File | Description |
  |------|-------------|
  | components/CurrencyConverter.tsx  | Fiat currency converter (static rates — swap for live API) |
  | components/CryptoCurrencyConverter.tsx | Stablecoin → USD converter with real-time CoinGecko prices |
  | backend/cryptoRoutes.ts           | Express backend routes (3 endpoints) |

  ## Requirements
  ```
  npm install @tanstack/react-query lucide-react
  ```
  Plus your existing shadcn/ui setup (Card, Button, Input, Label, Select, Badge).

  ## Usage

  ### CurrencyConverter (no backend needed)
  ```tsx
  import CurrencyConverter from "./components/CurrencyConverter";

  export default function App() {
    return <CurrencyConverter />;
  }
  ```

  ### CryptoCurrencyConverter (needs backend)
  ```tsx
  import CryptoCurrencyConverter from "./components/CryptoCurrencyConverter";

  export default function App() {
    const { user } = useAuth(); // your auth hook
    return (
      <CryptoCurrencyConverter
        isAuthenticated={!!user}
        onSignInClick={() => navigate("/login")}
      />
    );
  }
  ```

  ### Backend (Express)
  ```ts
  import cryptoRoutes from "./backend/cryptoRoutes";
  app.use(cryptoRoutes);
  ```

  ## Fee Structure (Crypto Converter)
  | Fee | Rate |
  |-----|------|
  | Service fee | 3.0% |
  | Network/exchange fee | 0.5% |
  | Compliance fee | 0.2% |
  | **Total** | **3.7%** |

  Minimum final amount after fees: **$10.00 USD**

  ## Live Crypto Prices
  Prices are fetched from the free [CoinGecko API](https://www.coingecko.com/en/api) — no API key required.
  The component auto-refreshes every 60 seconds.
  