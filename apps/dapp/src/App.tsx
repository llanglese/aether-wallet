import { useState } from "react";
import { ConnectPanel } from "./components/ConnectPanel";
import { TransferPanel } from "./components/TransferPanel";
import { GuestbookPanel } from "./components/GuestbookPanel";
import { LocalWalletPanel } from "./components/LocalWalletPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { DEMO_SEPOLIA_ADDRESS } from "@aether/wallet-core";

type Tab = "wallet" | "transfer" | "guestbook" | "local" | "history";

export default function App() {
  const [tab, setTab] = useState<Tab>("wallet");

  return (
    <main>
      <header className="card">
        <h1>Aether Wallet</h1>
        <p className="muted">
          Ethereum wallet toolkit + demo DApp. HD derivation, encrypted keystore,
          ETH/ERC-20 transfers, and on-chain contract interaction on Sepolia /
          mainnet.
        </p>
        <p className="muted mono">
          Demo Sepolia address: {DEMO_SEPOLIA_ADDRESS}
        </p>
      </header>

      <nav className="tabs">
        {(
          [
            ["wallet", "Connect"],
            ["transfer", "Transfer"],
            ["guestbook", "Contract"],
            ["local", "HD / Keystore"],
            ["history", "History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "wallet" && <ConnectPanel />}
      {tab === "transfer" && <TransferPanel />}
      {tab === "guestbook" && <GuestbookPanel />}
      {tab === "local" && <LocalWalletPanel />}
      {tab === "history" && <HistoryPanel />}
    </main>
  );
}
