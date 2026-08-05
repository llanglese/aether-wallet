import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useChainId,
  useEstimateFeesPerGas,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  DEMO_SEPOLIA_ADDRESS,
  appendTxRecord,
  loadContacts,
  type Contact,
} from "@aether/wallet-core";
import { TokenTransferPanel } from "./TokenTransferPanel";

const ETH_TRANSFER_GAS = 21_000n;

export function TransferPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [to, setTo] = useState<string>(DEMO_SEPOLIA_ADDRESS);
  const [amount, setAmount] = useState("0.001");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { data: feeData } = useEstimateFeesPerGas({
    query: { enabled: isConnected },
  });
  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const gasHint = useMemo(() => {
    const maxFee = feeData?.maxFeePerGas ?? feeData?.gasPrice;
    if (!maxFee) return "";
    return `Est. max fee ≈ ${formatEther(ETH_TRANSFER_GAS * maxFee)} ETH (gas ${ETH_TRANSFER_GAS.toString()})`;
  }, [feeData]);

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

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
            {contacts.length > 0 && (
              <div className="field">
                <label htmlFor="contact-pick">From address book</label>
                <select
                  id="contact-pick"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) setTo(e.target.value);
                  }}
                >
                  <option value="">Select a contact…</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.address}>
                      {c.label} ({c.address.slice(0, 8)}…)
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            {gasHint ? (
              <p className="muted">{gasHint}</p>
            ) : (
              <p className="muted">Estimating max fee…</p>
            )}
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
