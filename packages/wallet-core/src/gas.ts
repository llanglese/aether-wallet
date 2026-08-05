import { formatEther, parseEther } from "ethers";
import { createProvider } from "./balance.js";
import { NETWORKS, type NetworkKey } from "./networks.js";

export interface GasEstimate {
  network: NetworkKey;
  gasLimit: bigint;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  /** Rough upper-bound fee in ETH for EIP-1559 style txs. */
  estimatedFeeEth: string;
}

/**
 * Estimate gas + fee data for a simple ETH transfer (21k gas).
 */
export async function estimateEthTransferGas(input: {
  network: NetworkKey;
  rpcUrl?: string;
  to?: string;
  amountEth?: string;
}): Promise<GasEstimate> {
  const provider = createProvider(input.network, input.rpcUrl);
  const fee = await provider.getFeeData();
  const gasLimit = 21_000n;
  const maxFee = fee.maxFeePerGas ?? fee.gasPrice ?? null;
  const estimatedFeeEth =
    maxFee !== null ? formatEther(gasLimit * maxFee) : "0";

  // Touch estimateGas when we have a recipient so RPC path is exercised.
  if (input.to) {
    try {
      await provider.estimateGas({
        to: input.to,
        value: parseEther(input.amountEth ?? "0"),
      });
    } catch {
      // Keep the standard 21k fallback for UI demos when balance is empty.
    }
  }

  return {
    network: input.network,
    gasLimit,
    maxFeePerGas: fee.maxFeePerGas ?? null,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? null,
    estimatedFeeEth,
  };
}

export function explorerAddressUrl(
  network: NetworkKey,
  address: string,
): string | undefined {
  const base = NETWORKS[network].explorer;
  return base ? `${base}/address/${address}` : undefined;
}
