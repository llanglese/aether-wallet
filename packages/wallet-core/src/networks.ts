/** Supported EVM networks for balance/transfer flows. */
export type NetworkKey = "sepolia" | "mainnet" | "anvil";

export interface NetworkConfig {
  key: NetworkKey;
  chainId: number;
  name: string;
  rpcEnvVar: string;
  defaultRpcUrl: string;
  explorer: string;
  isTestnet: boolean;
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  sepolia: {
    key: "sepolia",
    chainId: 11155111,
    name: "Sepolia",
    rpcEnvVar: "SEPOLIA_RPC_URL",
    defaultRpcUrl: "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
    isTestnet: true,
  },
  mainnet: {
    key: "mainnet",
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcEnvVar: "MAINNET_RPC_URL",
    defaultRpcUrl: "https://cloudflare-eth.com",
    explorer: "https://etherscan.io",
    isTestnet: false,
  },
  anvil: {
    key: "anvil",
    chainId: 31337,
    name: "Anvil Local",
    rpcEnvVar: "ANVIL_RPC_URL",
    defaultRpcUrl: "http://127.0.0.1:8545",
    explorer: "",
    isTestnet: true,
  },
};

/** Public Sepolia address used in demos / README (never a secret). */
export const DEMO_SEPOLIA_ADDRESS =
  "0x86b3A00CcE3569582CE7E5601Cc917E8720b03A9" as const;
