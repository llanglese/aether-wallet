import { useState } from "react";
import { ConnectPanel } from "./components/ConnectPanel";
import { TransferPanel } from "./components/TransferPanel";
import { GuestbookPanel } from "./components/GuestbookPanel";
import { LocalWalletPanel } from "./components/LocalWalletPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ContactsPanel } from "./components/ContactsPanel";
import { SignMessagePanel } from "./components/SignMessagePanel";
import { DEMO_SEPOLIA_ADDRESS } from "@aether/wallet-core";

type Tab =
  | "wallet"
  | "transfer"
  | "guestbook"
  | "local"
  | "contacts"
  | "sign"
  | "history";

const NAV: { id: Tab; label: string; hint: string }[] = [
  { id: "wallet", label: "Overview", hint: "Connect & balances" },
  { id: "transfer", label: "Transfer", hint: "ETH / ERC-20" },
  { id: "guestbook", label: "Contracts", hint: "Guestbook demo" },
  { id: "local", label: "Keys", hint: "HD / Keystore" },
  { id: "contacts", label: "Address book", hint: "Saved recipients" },
  { id: "sign", label: "Sign", hint: "EIP-191 messages" },
  { id: "history", label: "Activity", hint: "Local tx log" },
];

const TITLES: Record<Tab, { title: string; subtitle: string }> = {
  wallet: {
    title: "Overview",
    subtitle: "Connect MetaMask and inspect network balances.",
  },
  transfer: {
    title: "Transfer",
    subtitle: "Send ETH or ERC-20 with gas estimate helpers.",
  },
  guestbook: {
    title: "Contracts",
    subtitle: "Read and write the Sepolia Guestbook demo.",
  },
  local: {
    title: "Keys",
    subtitle: "Generate HD wallets and manage encrypted keystores.",
  },
  contacts: {
    title: "Address book",
    subtitle: "Keep frequent recipients in local storage.",
  },
  sign: {
    title: "Sign",
    subtitle: "EIP-191 personal_sign and recover the signer.",
  },
  history: {
    title: "Activity",
    subtitle: "Local transaction history with explorer links.",
  },
};

export default function App() {
  const [tab, setTab] = useState<Tab>("wallet");
  const meta = TITLES[tab];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-name">Aether</p>
            <p className="brand-tag">Exchange Wallet Console</p>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "nav-item active" : "nav-item"}
              onClick={() => setTab(item.id)}
            >
              <span className="nav-label">{item.label}</span>
              <span className="nav-hint">{item.hint}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <p className="eyebrow">Demo recipient</p>
          <p className="mono tiny">{DEMO_SEPOLIA_ADDRESS}</p>
          <p className="muted tiny">Sepolia · testnet only</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Aether Console</p>
            <h1>{meta.title}</h1>
            <p className="muted">{meta.subtitle}</p>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Live on Sepolia
          </div>
        </header>

        <div className="workspace-body">
          {tab === "wallet" && <ConnectPanel />}
          {tab === "transfer" && <TransferPanel />}
          {tab === "guestbook" && <GuestbookPanel />}
          {tab === "local" && <LocalWalletPanel />}
          {tab === "contacts" && <ContactsPanel />}
          {tab === "sign" && <SignMessagePanel />}
          {tab === "history" && <HistoryPanel />}
        </div>
      </div>
    </div>
  );
}
