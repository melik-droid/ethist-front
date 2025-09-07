import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import MoneyAvatar from "./components/MoneyAvatar";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "./wagmi";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={midnightTheme({
          accentColor: "#D4FF00",
          accentColorForeground: "#0D0D0D",
          borderRadius: "medium",
          overlayBlur: "small",
        })}
        modalSize="compact"
        avatar={MoneyAvatar}
      >
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
