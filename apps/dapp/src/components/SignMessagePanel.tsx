import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  recoverPersonalMessageSigner,
  signPersonalMessage,
} from "@aether/wallet-core";

/**
 * Demonstrate EIP-191 personal_sign via connected wallet, or offline with a
 * pasted private key (demo / learning only).
 */
export function SignMessagePanel() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending, error } = useSignMessage();
  const [message, setMessage] = useState("Hello from Aether Wallet");
  const [signature, setSignature] = useState("");
  const [recovered, setRecovered] = useState("");
  const [offlineKey, setOfflineKey] = useState("");
  const [localError, setLocalError] = useState("");

  return (
    <section className="card">
      <h2>Sign message (EIP-191)</h2>
      <p className="muted">
        Sign an arbitrary message with your connected wallet, or offline with a
        private key from the HD / Keystore tab. Verify recovers the signer
        address.
      </p>

      <div className="field">
        <label htmlFor="sign-message">Message</label>
        <textarea
          id="sign-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="row" style={{ marginBottom: "0.85rem" }}>
        <button
          type="button"
          disabled={!isConnected || !message || isPending}
          onClick={async () => {
            try {
              setLocalError("");
              const sig = await signMessageAsync({ message });
              setSignature(sig);
              setRecovered(recoverPersonalMessageSigner(message, sig));
            } catch (e) {
              setLocalError(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          {isPending ? "Waiting for wallet…" : "Sign with connected wallet"}
        </button>
      </div>

      {isConnected && (
        <p className="mono muted">Connected: {address}</p>
      )}

      <div className="field">
        <label htmlFor="offline-key">Offline private key (optional)</label>
        <input
          id="offline-key"
          type="password"
          value={offlineKey}
          onChange={(e) => setOfflineKey(e.target.value)}
          placeholder="0x…"
        />
      </div>
      <button
        type="button"
        className="secondary"
        disabled={!offlineKey || !message}
        onClick={async () => {
          try {
            setLocalError("");
            const result = await signPersonalMessage({
              privateKey: offlineKey,
              message,
            });
            setSignature(result.signature);
            setRecovered(
              recoverPersonalMessageSigner(result.message, result.signature),
            );
          } catch (e) {
            setLocalError(e instanceof Error ? e.message : String(e));
          }
        }}
      >
        Sign offline (wallet-core)
      </button>

      {signature && (
        <>
          <p className="mono" style={{ marginTop: "0.85rem", wordBreak: "break-all" }}>
            Signature: {signature}
          </p>
          <p className="mono muted">Recovered signer: {recovered}</p>
        </>
      )}
      {(error || localError) && (
        <p className="err">{error?.message ?? localError}</p>
      )}
    </section>
  );
}
