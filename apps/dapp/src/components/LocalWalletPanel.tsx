import { useMemo, useState } from "react";
import {
  createMnemonic,
  decryptKeystoreToPrivateKey,
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
  const [importJson, setImportJson] = useState("");
  const [importPassword, setImportPassword] = useState("password123");
  const [importedKey, setImportedKey] = useState("");
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
        Generate a mnemonic, derive account index N, encrypt to Keystore V3, or
        import an existing keystore. Secrets never leave this browser tab.
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

      <hr style={{ margin: "1.25rem 0", border: 0, borderTop: "1px solid rgba(148, 183, 204, 0.16)" }} />

      <h3>Import keystore</h3>
      <p className="muted">
        Paste Keystore V3 JSON and unlock with the password to recover the
        private key locally.
      </p>
      <div className="field">
        <label htmlFor="import-json">Keystore JSON</label>
        <textarea
          id="import-json"
          rows={6}
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='{"version":3,"id":"...","crypto":{...}}'
        />
      </div>
      <div className="field">
        <label htmlFor="import-password">Password</label>
        <input
          id="import-password"
          type="password"
          value={importPassword}
          onChange={(e) => setImportPassword(e.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={!importJson.trim()}
        onClick={async () => {
          try {
            setError("");
            setImportedKey("");
            const pk = await decryptKeystoreToPrivateKey(
              importJson,
              importPassword,
            );
            setImportedKey(pk);
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
          }
        }}
      >
        Unlock keystore
      </button>
      {importedKey && (
        <p className="mono muted" style={{ marginTop: "0.75rem" }}>
          Recovered private key: {importedKey}
        </p>
      )}

      {error && <p className="err">{error}</p>}
    </section>
  );
}
