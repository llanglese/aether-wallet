export interface Contact {
  id: string;
  label: string;
  address: string;
  createdAt: number;
}

const STORAGE_KEY = "aether.wallet.contacts.v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadContacts(): Contact[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Contact[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts: Contact[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export function upsertContact(input: {
  label: string;
  address: string;
}): Contact {
  const label = input.label.trim();
  const address = input.address.trim();
  if (!label) throw new Error("label is required");
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("invalid Ethereum address");
  }

  const list = loadContacts().filter(
    (c) => c.address.toLowerCase() !== address.toLowerCase(),
  );
  const next: Contact = {
    id: crypto.randomUUID(),
    label,
    address,
    createdAt: Date.now(),
  };
  saveContacts([next, ...list]);
  return next;
}

export function removeContact(id: string): void {
  saveContacts(loadContacts().filter((c) => c.id !== id));
}

export function clearContacts(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
