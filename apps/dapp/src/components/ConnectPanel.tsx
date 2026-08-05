import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export function ConnectPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [hasInjected, setHasInjected] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHasInjected(typeof window !== "undefined" && Boolean(window.ethereum));
  }, []);

  const networkLabel =
    chainId === sepolia.id
      ? "Sepolia"
      : chainId === mainnet.id
        ? "Ethereum Mainnet"
        : `Unknown (chainId ${chainId})`;

  return (
    <section className="card">
      <h2>Wallet connection</h2>
      <p className="muted">
        Connect an injected wallet (MetaMask). Switch between Sepolia and
        Ethereum mainnet.
      </p>

      {!hasInjected && (
        <p className="err">
          No browser wallet detected. Open this page in Chrome/Edge with the
          MetaMask extension installed (not Cursor&apos;s Simple Browser), unlock
          MetaMask, then click Connect again.
        </p>
      )}

      {!isConnected ? (
        <div className="row">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              disabled={isPending || !hasInjected}
              onClick={() => connect({ connector })}
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="mono">Address: {address}</p>
          <p className="mono">
            Balance: {balance ? `${balance.formatted} ${balance.symbol}` : "…"}
          </p>
          <p className="muted">
            Network: {networkLabel} · Chain ID {chainId}
          </p>
          <div className="row">
            <button
              type="button"
              className="secondary"
              onClick={async () => {
                if (!address) return;
                try {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy address"}
            </button>
            <button
              type="button"
              className={chainId === sepolia.id ? "active" : ""}
              onClick={() => switchChain({ chainId: sepolia.id })}
            >
              Use Sepolia
            </button>
            <button
              type="button"
              className={
                chainId === mainnet.id ? "active" : "secondary"
              }
              onClick={() => switchChain({ chainId: mainnet.id })}
            >
              Use Mainnet
            </button>
            <button type="button" className="secondary" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        </>
      )}

      {error && <p className="err">{error.message}</p>}
    </section>
  );
}
