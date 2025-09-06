import { riseTestnetConfig, riseTestnet } from "rise-wallet";
import { createConfig, http } from "wagmi";
import { porto } from "porto/wagmi";

export const config = createConfig({
  chains: [riseTestnet],
  connectors: [porto(riseTestnetConfig)],
  transports: {
    [riseTestnet.id]: http(),
  },
});
