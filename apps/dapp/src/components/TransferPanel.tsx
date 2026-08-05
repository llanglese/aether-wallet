import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { DEMO_SEPOLIA_ADDRESS, appendTxRecord } from "@aether/wallet-core";
import { TokenTransferPanel } from "./TokenTransferPanel";

export function TransferPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [to, setTo] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [amount, setAmount] = useState("0.001");
  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isSuccess || !hash || !address) return;
    appendTxRecord({
      kind: "eth",
      hash,
      from: address,
      to,
      amount: `${amount} ETH`,
      chainId,
    });
  }, [isSuccess, hash, address, to, amount, chainId]);

  return (
    <>
      <section className="card">
        <h2>ETH transfer</h2>
        <p className="muted">
          Build and broadcast a native transfer with your connected wallet.
        </p>

        {!isConnected ? (
          <p className="muted">Connect a wallet first.</p>
        ) : (
          <>
            <p className="mono muted">From: {address}</p>
            <div className="field">
              <label htmlFor="to">Recipient</label>
              <input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="amount">Amount (ETH)</label>
              <input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={isPending || confirming}
              onClick={() =>
                sendTransaction({
                  to: to as `0x${string}`,
                  value: parseEther(amount),
                })
              }
            >
              {isPending || confirming ? "Submitting…" : "Send ETH"}
            </button>
          </>
        )}

        {hash && <p className="mono">Tx: {hash}</p>}
        {isSuccess && <p className="ok">Confirmed on-chain.</p>}
        {error && <p className="err">{error.message}</p>}
      </section>

      <TokenTransferPanel />
    </>
  );
}
