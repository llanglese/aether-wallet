import {
  Contract,
  Wallet,
  parseEther,
  Transaction,
  type TransactionRequest,
} from "ethers";
import { ERC20_ABI, createProvider } from "./balance.js";
import { NETWORKS, type NetworkKey } from "./networks.js";

export interface SignedTxResult {
  hash: string;
  rawTransaction: string;
  from: string;
  to: string;
  nonce: number;
}

export interface BroadcastResult {
  hash: string;
  network: NetworkKey;
  explorerUrl?: string;
}

/**
 * Build, sign, and optionally broadcast a native ETH transfer.
 */
export async function signEthTransfer(input: {
  privateKey: string;
  to: string;
  amountEth: string;
  network: NetworkKey;
  rpcUrl?: string;
  broadcast?: boolean;
}): Promise<SignedTxResult & Partial<BroadcastResult>> {
  const provider = createProvider(input.network, input.rpcUrl);
  const wallet = new Wallet(input.privateKey, provider);
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const fee = await provider.getFeeData();

  const tx: TransactionRequest = {
    to: input.to,
    value: parseEther(input.amountEth),
    chainId: NETWORKS[input.network].chainId,
    nonce,
    type: 2,
    maxFeePerGas: fee.maxFeePerGas ?? undefined,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined,
    gasLimit: 21_000n,
  };

  const rawTransaction = await wallet.signTransaction(tx);
  const parsed = Transaction.from(rawTransaction);

  if (input.broadcast) {
    const resp = await provider.broadcastTransaction(rawTransaction);
    return {
      hash: resp.hash,
      rawTransaction,
      from: wallet.address,
      to: input.to,
      nonce,
      network: input.network,
      explorerUrl: explorerTx(input.network, resp.hash),
    };
  }

  return {
    hash: parsed.hash!,
    rawTransaction,
    from: wallet.address,
    to: input.to,
    nonce,
  };
}

export async function signErc20Transfer(input: {
  privateKey: string;
  tokenAddress: string;
  to: string;
  amountRaw: bigint;
  network: NetworkKey;
  rpcUrl?: string;
  broadcast?: boolean;
}): Promise<SignedTxResult & Partial<BroadcastResult>> {
  const provider = createProvider(input.network, input.rpcUrl);
  const wallet = new Wallet(input.privateKey, provider);
  const token = new Contract(input.tokenAddress, ERC20_ABI, wallet);
  const data = token.interface.encodeFunctionData("transfer", [
    input.to,
    input.amountRaw,
  ]);
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const fee = await provider.getFeeData();
  const gasLimit = await provider.estimateGas({
    from: wallet.address,
    to: input.tokenAddress,
    data,
  });

  const tx: TransactionRequest = {
    to: input.tokenAddress,
    data,
    chainId: NETWORKS[input.network].chainId,
    nonce,
    type: 2,
    maxFeePerGas: fee.maxFeePerGas ?? undefined,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined,
    gasLimit,
  };

  const rawTransaction = await wallet.signTransaction(tx);
  const parsed = Transaction.from(rawTransaction);

  if (input.broadcast) {
    const resp = await provider.broadcastTransaction(rawTransaction);
    return {
      hash: resp.hash,
      rawTransaction,
      from: wallet.address,
      to: input.tokenAddress,
      nonce,
      network: input.network,
      explorerUrl: explorerTx(input.network, resp.hash),
    };
  }

  return {
    hash: parsed.hash!,
    rawTransaction,
    from: wallet.address,
    to: input.tokenAddress,
    nonce,
  };
}

export async function broadcastRawTransaction(
  rawTransaction: string,
  network: NetworkKey,
  rpcUrl?: string,
): Promise<BroadcastResult> {
  const provider = createProvider(network, rpcUrl);
  const resp = await provider.broadcastTransaction(rawTransaction);
  return {
    hash: resp.hash,
    network,
    explorerUrl: explorerTx(network, resp.hash),
  };
}

function explorerTx(network: NetworkKey, hash: string): string | undefined {
  const base = NETWORKS[network].explorer;
  return base ? `${base}/tx/${hash}` : undefined;
}
