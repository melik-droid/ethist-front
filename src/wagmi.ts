import { riseTestnetConfig, riseTestnet } from "rise-wallet";
import { createConfig, http } from "wagmi";
import { porto } from "porto/wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet } from "@rainbow-me/rainbowkit/wallets";

const appName = "Racfella";
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

// Explicit wallet list with MetaMask (shows install CTA if missing), plus Coinbase and WalletConnect
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        ...(projectId ? [walletConnectWallet] : []),
      ],
    },
    {
      groupName: "More",
      wallets: [injectedWallet],
    },
  ],
  { appName, projectId: projectId ?? "" }
);

export const config = createConfig({
  chains: [riseTestnet],
  // Keep Rise/Porto plus explicit RainbowKit wallets
  connectors: [...connectors, porto(riseTestnetConfig)],
  transports: {
    [riseTestnet.id]: http(),
  },
});
