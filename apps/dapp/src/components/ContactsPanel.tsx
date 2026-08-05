import { useState } from "react";
import {
  DEMO_SEPOLIA_ADDRESS,
  clearContacts,
  loadContacts,
  removeContact,
  upsertContact,
  type Contact,
} from "@aether/wallet-core";

export function ContactsPanel() {
  const [items, setItems] = useState<Contact[]>(() => loadContacts());
  const [label, setLabel] = useState("Demo Sepolia");
  const [address, setAddress] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [error, setError] = useState("");

  return (
    <section className="card">
      <h2>Address book</h2>
      <p className="muted">
        Save frequently used addresses in this browser (localStorage). Use them
        as transfer recipients without retyping.
      </p>

      <div className="field">
        <label htmlFor="contact-label">Label</label>
        <input
          id="contact-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-address">Address</label>
        <input
          id="contact-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>
      <div className="row" style={{ marginBottom: "0.85rem" }}>
        <button
          type="button"
          onClick={() => {
            try {
              setError("");
              upsertContact({ label, address });
              setItems(loadContacts());
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          Save contact
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            clearContacts();
            setItems([]);
          }}
        >
          Clear all
        </button>
      </div>

      {error && <p className="err">{error}</p>}

      {items.length === 0 ? (
        <p className="muted">No contacts yet.</p>
      ) : (
        <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ marginBottom: "0.75rem" }}>
              <div>
                <strong>{item.label}</strong>
              </div>
              <div className="mono muted">{item.address}</div>
              <button
                type="button"
                className="secondary"
                style={{ marginTop: "0.35rem" }}
                onClick={() => {
                  removeContact(item.id);
                  setItems(loadContacts());
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
