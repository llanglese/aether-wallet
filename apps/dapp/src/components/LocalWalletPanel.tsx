import { useMemo, useState } from "react";
import {
  createMnemonic,
  deriveAccount,
  encryptPrivateKeyToKeystore,
  validateMnemonic,
} from "@aether/wallet-core";

/**
 * Browser-side demo of the HD + keystore helpers.
 * For learning only — prefer a hardware wallet or MetaMask for real funds.
 */
export function LocalWalletPanel() {
  const [mnemonic, setMnemonic] = useState("");
  const [index, setIndex] = useState(0);
  const [password, setPassword] = useState("password123");
  const [keystore, setKeystore] = useState("");
  const [error, setError] = useState("");

  const account = useMemo(() => {
    if (!mnemonic || !validateMnemonic(mnemonic)) return null;
    try {
      return deriveAccount(mnemonic, index);
    } catch {
      return null;
    }
  }, [mnemonic, index]);

  return (
    <section className="card">
      <h2>HD wallet &amp; keystore (local)</h2>
      <p className="muted">
        Generate a mnemonic, derive account index N, and encrypt the private key
        to Keystore V3 JSON. Secrets never leave this browser tab.
      </p>

      <div className="row" style={{ marginBottom: "0.85rem" }}>
        <button
          type="button"
          onClick={() => {
            setError("");
            setMnemonic(createMnemonic());
            setKeystore("");
            setIndex(0);
          }}
        >
          Generate mnemonic
        </button>
      </div>

      <div className="field">
        <label htmlFor="mnemonic">Mnemonic</label>
        <textarea
          id="mnemonic"
          rows={3}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="index">Account index</label>
        <input
          id="index"
          type="number"
          min={0}
          value={index}
          onChange={(e) => setIndex(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      {account && (
        <>
          <p className="mono">Path: {account.path}</p>
          <p className="mono">Address: {account.address}</p>
          <p className="mono muted">Private key: {account.privateKey}</p>
        </>
      )}

      <div className="field">
        <label htmlFor="password">Keystore password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="button"
        disabled={!account}
        onClick={async () => {
          if (!account) return;
          try {
            setError("");
            const json = await encryptPrivateKeyToKeystore(
              account.privateKey,
              password,
            );
            setKeystore(json);
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
          }
        }}
      >
        Encrypt to keystore
      </button>

      {keystore && (
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label>Keystore JSON</label>
          <textarea rows={8} readOnly value={keystore} />
        </div>
      )}
      {error && <p className="err">{error}</p>}
    </section>
  );
}
