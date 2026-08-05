/** Optional deployed addresses after `pnpm deploy:sepolia`. */
export const CONTRACTS = {
  guestbook: (import.meta.env.VITE_GUESTBOOK_ADDRESS || "") as `0x${string}` | "",
  aetherToken: (import.meta.env.VITE_AETHER_TOKEN_ADDRESS ||
    "") as `0x${string}` | "",
};

export const GUESTBOOK_ABI = [
  {
    type: "function",
    name: "postMessage",
    stateMutability: "nonpayable",
    inputs: [{ name: "content", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "latestMessage",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "latestAuthor",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "messageCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
