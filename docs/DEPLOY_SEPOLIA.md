# Deploy Aether contracts to Sepolia

Goal: get `Guestbook` + `AetherToken` addresses so the DApp Contract / ERC-20 tabs work locally and on Vercel.

## Before you start

- MetaMask Sepolia account with some test ETH (your demo address is fine as a funded wallet)
- A **throwaway** deployer private key (export from MetaMask → Account details → Show private key). Prefer a separate test account, not your main seed phrase shared elsewhere.
- Never commit `.env` or private keys. Never paste keys into chat.

## 1. Root `.env`

From repo root `D:\aether-wallet`, copy `.env.example` → `.env` and set:

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.org
DEPLOYER_PRIVATE_KEY=0xYOUR_TEST_PRIVATE_KEY
```

Hardhat loads `../.env` from `contracts/` (see `hardhat.config.ts`).

## 2. Deploy

```powershell
cd D:\aether-wallet
npx pnpm@9.15.4 --filter @aether/contracts run deploy:sepolia
```

Or:

```powershell
cd D:\aether-wallet\contracts
npx pnpm@9.15.4 exec hardhat run scripts/deploy.ts --network sepolia
```

The script prints addresses and writes:

`contracts/deployments/sepolia-11155111.env.snippet`

## 3. Local DApp

Copy the printed `VITE_*` lines into `apps/dapp/.env`, then restart:

```powershell
cd D:\aether-wallet
npx pnpm@9.15.4 --filter @aether/dapp dev
```

Open Transfer → paste `VITE_AETHER_TOKEN_ADDRESS` into the token field (or set env so it pre-fills). Open Contract to post Guestbook messages.

## 4. Live demo (Vercel)

1. Vercel → `aether-wallet-dapp` → Settings → Environment Variables  
2. Add Production: `VITE_GUESTBOOK_ADDRESS`, `VITE_AETHER_TOKEN_ADDRESS`, optional `VITE_SEPOLIA_RPC_URL`  
3. Deployments → Redeploy (Vite bakes env at build time)

Live: https://aether-wallet-dapp.vercel.app

## Safety

- Do not push `.env`, keystores, or mnemonics
- `contracts/deployments/*.env.snippet` contains only public addresses (safe to keep locally; optional to gitignore if you prefer)
