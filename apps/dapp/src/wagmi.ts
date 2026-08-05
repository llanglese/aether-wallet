import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || undefined),
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL || undefined),
  },
});
