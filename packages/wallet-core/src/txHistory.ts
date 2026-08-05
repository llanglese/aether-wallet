export type LocalTxKind = "eth" | "erc20" | "contract";

export interface LocalTxRecord {
  id: string;
  kind: LocalTxKind;
  hash: string;
  from: string;
  to: string;
  amount?: string;
  chainId: number;
  createdAt: number;
  note?: string;
}

const STORAGE_KEY = "aether.wallet.txHistory.v1";

/** Read local demo history (browser localStorage). */
export function loadTxHistory(): LocalTxRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalTxRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTxHistory(records: LocalTxRecord[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 50)));
}

export function appendTxRecord(
  record: Omit<LocalTxRecord, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): LocalTxRecord[] {
  const next: LocalTxRecord = {
    id: record.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: record.createdAt ?? Date.now(),
    kind: record.kind,
    hash: record.hash,
    from: record.from,
    to: record.to,
    amount: record.amount,
    chainId: record.chainId,
    note: record.note,
  };
  const list = [next, ...loadTxHistory()];
  saveTxHistory(list);
  return list;
}

export function clearTxHistory(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
