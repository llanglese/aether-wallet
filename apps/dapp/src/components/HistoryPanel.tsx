import { useState } from "react";
import {
  clearTxHistory,
  loadTxHistory,
  type LocalTxRecord,
} from "@aether/wallet-core";

export function HistoryPanel() {
  const [items, setItems] = useState<LocalTxRecord[]>(() => loadTxHistory());

  return (
    <section className="card">
      <h2>Local transaction history</h2>
      <p className="muted">
        Recent transfers from this browser session (stored in localStorage for
        demo purposes).
      </p>

      <div className="row" style={{ marginBottom: "0.85rem" }}>
        <button
          type="button"
          className="secondary"
          onClick={() => setItems(loadTxHistory())}
        >
          Refresh
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            clearTxHistory();
            setItems([]);
          }}
        >
          Clear
        </button>
      </div>

      {items.length === 0 ? (
        <p className="muted">No local records yet.</p>
      ) : (
        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ marginBottom: "0.75rem" }}>
              <div className="mono">
                [{item.kind}] {item.hash}
              </div>
              <div className="muted">
                {item.amount ?? "—"} → {item.to} · chain {item.chainId} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
