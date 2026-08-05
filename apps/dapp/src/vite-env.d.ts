/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEPOLIA_RPC_URL?: string;
  readonly VITE_MAINNET_RPC_URL?: string;
  readonly VITE_GUESTBOOK_ADDRESS?: string;
  readonly VITE_AETHER_TOKEN_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: unknown;
}
