import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { appendTxRecord } from "@aether/wallet-core";
import { CONTRACTS, GUESTBOOK_ABI } from "../abis";

export function GuestbookPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [message, setMessage] = useState("Hello from Aether Wallet");
  const enabled = Boolean(CONTRACTS.guestbook);

  const { data: latestMessage, refetch } = useReadContract({
    address: CONTRACTS.guestbook || undefined,
    abi: GUESTBOOK_ABI,
    functionName: "latestMessage",
    query: { enabled },
  });

  const { data: count } = useReadContract({
    address: CONTRACTS.guestbook || undefined,
    abi: GUESTBOOK_ABI,
    functionName: "messageCount",
    query: { enabled },
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess || !hash || !address || !CONTRACTS.guestbook) return;
    appendTxRecord({
      kind: "contract",
      hash,
      from: address,
      to: CONTRACTS.guestbook,
      chainId,
      note: "Guestbook.postMessage",
    });
  }, [isSuccess, hash, address, chainId]);

  return (
    <section className="card">
      <h2>Contract interaction</h2>
      <p className="muted">
        Read/write the demo Guestbook contract. Set{" "}
        <span className="mono">VITE_GUESTBOOK_ADDRESS</span> after deploying.
      </p>

      {!enabled && (
        <p className="err">
          Guestbook address is not configured. Deploy contracts, then add the
          address to <span className="mono">apps/dapp/.env</span>.
        </p>
      )}

      {enabled && (
        <>
          <p className="mono">Latest: {String(latestMessage ?? "—")}</p>
          <p className="muted">Messages: {count?.toString() ?? "0"}</p>
          <div className="field">
            <label htmlFor="msg">New message</label>
            <textarea
              id="msg"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="row">
            <button
              type="button"
              disabled={!isConnected || isPending || !CONTRACTS.guestbook}
              onClick={() =>
                writeContract({
                  address: CONTRACTS.guestbook as `0x${string}`,
                  abi: GUESTBOOK_ABI,
                  functionName: "postMessage",
                  args: [message],
                })
              }
            >
              {isPending ? "Writing…" : "Post message"}
            </button>
            <button type="button" className="secondary" onClick={() => refetch()}>
              Refresh
            </button>
          </div>
        </>
      )}

      {hash && <p className="mono">Tx: {hash}</p>}
      {isSuccess && <p className="ok">Message posted.</p>}
      {error && <p className="err">{error.message}</p>}
    </section>
  );
}
