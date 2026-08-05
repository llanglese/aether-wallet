import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  DEMO_SEPOLIA_ADDRESS,
  appendTxRecord,
  loadWatchedTokens,
  removeWatchedToken,
  upsertWatchedToken,
  type WatchedToken,
} from "@aether/wallet-core";
import { CONTRACTS, ERC20_ABI } from "../abis";

export function TokenTransferPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [token, setToken] = useState<string>(CONTRACTS.aetherToken || "");
  const [to, setTo] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [spender, setSpender] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [amount, setAmount] = useState("1");
  const [watched, setWatched] = useState<WatchedToken[]>(() =>
    loadWatchedTokens(),
  );
  const [listError, setListError] = useState("");
  const [pendingKind, setPendingKind] = useState<"transfer" | "approve" | null>(
    null,
  );
  const [lastKind, setLastKind] = useState<"transfer" | "approve" | null>(null);

  const tokenAddress = useMemo(
    () => (token.startsWith("0x") && token.length === 42 ? token : undefined),
    [token],
  );

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: Boolean(tokenAddress) },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: Boolean(tokenAddress) },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(tokenAddress && address) },
  });

  const spenderOk =
    spender.startsWith("0x") && spender.length === 42
      ? (spender as `0x${string}`)
      : undefined;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spenderOk ? [address, spenderOk] : undefined,
    query: { enabled: Boolean(tokenAddress && address && spenderOk) },
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess, isLoading: confirming } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isSuccess || !hash || !address || !tokenAddress || !pendingKind) return;
    const kind = pendingKind;
    appendTxRecord({
      kind: "erc20",
      hash,
      from: address,
      to: kind === "approve" ? spender : to,
      amount: `${amount} ${String(symbol ?? "TOKEN")}`,
      chainId,
      note:
        kind === "approve" ? `approve ${tokenAddress}` : `transfer ${tokenAddress}`,
    });
    setLastKind(kind);
    setPendingKind(null);
    void refetchBalance();
    void refetchAllowance();
  }, [
    isSuccess,
    hash,
    address,
    to,
    spender,
    amount,
    chainId,
    symbol,
    tokenAddress,
    pendingKind,
    refetchBalance,
    refetchAllowance,
  ]);

  const busy = isPending || confirming;

  return (
    <section className="card">
      <h2>ERC-20 transfer &amp; approve</h2>
      <p className="muted">
        Watch custom token addresses, transfer, or approve a spender. Deploy
        AetherToken (or paste any ERC-20) to try this on Sepolia.
      </p>

      {!isConnected ? (
        <p className="muted">Connect a wallet first.</p>
      ) : (
        <>
          {watched.length > 0 && (
            <div className="field">
              <label htmlFor="watched-token">Watched tokens</label>
              <select
                id="watched-token"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) setToken(e.target.value);
                }}
              >
                <option value="">Select a watched token…</option>
                {watched.map((t) => (
                  <option key={t.id} value={t.address}>
                    {t.label} ({t.address.slice(0, 8)}…)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="token">Token address</label>
            <input
              id="token"
              value={token}
              placeholder="0x..."
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div className="row" style={{ marginBottom: "0.85rem" }}>
            <button
              type="button"
              className="secondary"
              disabled={!tokenAddress}
              onClick={() => {
                try {
                  setListError("");
                  upsertWatchedToken({
                    address: token,
                    label: symbol ? String(symbol) : undefined,
                  });
                  setWatched(loadWatchedTokens());
                } catch (e) {
                  setListError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              Save to watchlist
            </button>
            {watched[0] && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  removeWatchedToken(watched[0]!.id);
                  setWatched(loadWatchedTokens());
                }}
              >
                Remove first watched
              </button>
            )}
          </div>
          {listError && <p className="err">{listError}</p>}

          {tokenAddress && (
            <p className="mono muted">
              Balance:{" "}
              {balance !== undefined && decimals !== undefined
                ? `${formatUnits(balance, decimals)} ${String(symbol ?? "")}`
                : "…"}
            </p>
          )}

          <div className="field">
            <label htmlFor="token-to">Recipient</label>
            <input
              id="token-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="token-amount">Amount</label>
            <input
              id="token-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={!tokenAddress || decimals === undefined || busy}
            onClick={() => {
              if (!tokenAddress || decimals === undefined) return;
              setPendingKind("transfer");
              writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [to as `0x${string}`, parseUnits(amount, decimals)],
              });
            }}
          >
            {busy && pendingKind === "transfer" ? "Submitting…" : "Send token"}
          </button>

          <hr
            style={{
              margin: "1.25rem 0",
              border: 0,
              borderTop: "1px solid #e2e8f0",
            }}
          />

          <h3>Approve spender</h3>
          <p className="muted">
            Allow another address to spend your tokens (standard ERC-20
            approve). Uses the Amount field above.
          </p>
          <div className="field">
            <label htmlFor="spender">Spender</label>
            <input
              id="spender"
              value={spender}
              onChange={(e) => setSpender(e.target.value)}
              placeholder="0x..."
            />
          </div>
          {tokenAddress &&
            allowance !== undefined &&
            decimals !== undefined && (
              <p className="mono muted">
                Current allowance: {formatUnits(allowance, decimals)}{" "}
                {String(symbol ?? "")}
              </p>
            )}
          <button
            type="button"
            className="secondary"
            disabled={!tokenAddress || decimals === undefined || !spenderOk || busy}
            onClick={() => {
              if (!tokenAddress || decimals === undefined || !spenderOk) return;
              setPendingKind("approve");
              writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [spenderOk, parseUnits(amount, decimals)],
              });
            }}
          >
            {busy && pendingKind === "approve"
              ? "Submitting…"
              : "Approve amount"}
          </button>
        </>
      )}

      {hash && <p className="mono">Tx: {hash}</p>}
      {isSuccess && (
        <p className="ok">
          {lastKind === "approve"
            ? "Approve confirmed."
            : "Token transfer confirmed."}
        </p>
      )}
      {error && <p className="err">{error.message}</p>}
    </section>
  );
}
