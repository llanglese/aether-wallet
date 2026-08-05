export interface WatchedToken {
  id: string;
  address: string;
  label: string;
  createdAt: number;
}

const STORAGE_KEY = "aether.wallet.tokens.v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadWatchedTokens(): WatchedToken[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchedToken[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWatchedTokens(tokens: WatchedToken[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function upsertWatchedToken(input: {
  address: string;
  label?: string;
}): WatchedToken {
  const address = input.address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("invalid token address");
  }
  const label = (input.label ?? "").trim() || `${address.slice(0, 8)}…`;
  const list = loadWatchedTokens().filter(
    (t) => t.address.toLowerCase() !== address.toLowerCase(),
  );
  const next: WatchedToken = {
    id: crypto.randomUUID(),
    address,
    label,
    createdAt: Date.now(),
  };
  saveWatchedTokens([next, ...list]);
  return next;
}

export function removeWatchedToken(id: string): void {
  saveWatchedTokens(loadWatchedTokens().filter((t) => t.id !== id));
}

export function clearWatchedTokens(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
