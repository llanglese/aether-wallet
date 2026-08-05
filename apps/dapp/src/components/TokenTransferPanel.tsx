import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { DEMO_SEPOLIA_ADDRESS, appendTxRecord } from "@aether/wallet-core";
import { CONTRACTS, ERC20_ABI } from "../abis";

export function TokenTransferPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [token, setToken] = useState<string>(CONTRACTS.aetherToken || "");
  const [to, setTo] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [amount, setAmount] = useState("1");

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

  const { data: balance, refetch } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(tokenAddress && address) },
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess, isLoading: confirming } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isSuccess || !hash || !address || !tokenAddress) return;
    appendTxRecord({
      kind: "erc20",
      hash,
      from: address,
      to,
      amount: `${amount} ${String(symbol ?? "TOKEN")}`,
      chainId,
      note: tokenAddress,
    });
    void refetch();
  }, [
    isSuccess,
    hash,
    address,
    to,
    amount,
    chainId,
    symbol,
    tokenAddress,
    refetch,
  ]);

  return (
    <section className="card">
      <h2>ERC-20 transfer</h2>
      <p className="muted">
        Transfer an ERC-20 token (for example the demo AetherToken after
        deploy).
      </p>

      {!isConnected ? (
        <p className="muted">Connect a wallet first.</p>
      ) : (
        <>
          <div className="field">
            <label htmlFor="token">Token address</label>
            <input
              id="token"
              value={token}
              placeholder="0x..."
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
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
            disabled={
              !tokenAddress ||
              decimals === undefined ||
              isPending ||
              confirming
            }
            onClick={() => {
              if (!tokenAddress || decimals === undefined) return;
              writeContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [to as `0x${string}`, parseUnits(amount, decimals)],
              });
            }}
          >
            {isPending || confirming ? "Submitting…" : "Send token"}
          </button>
        </>
      )}

      {hash && <p className="mono">Tx: {hash}</p>}
      {isSuccess && <p className="ok">Token transfer confirmed.</p>}
      {error && <p className="err">{error.message}</p>}
    </section>
  );
}
