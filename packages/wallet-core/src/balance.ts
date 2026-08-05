import {
  Contract,
  JsonRpcProvider,
  formatEther,
  formatUnits,
  parseUnits,
} from "ethers";
import { NETWORKS, type NetworkKey } from "./networks.js";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;

export function createProvider(
  network: NetworkKey,
  rpcUrlOverride?: string,
): JsonRpcProvider {
  const cfg = NETWORKS[network];
  const url = rpcUrlOverride ?? process.env[cfg.rpcEnvVar] ?? cfg.defaultRpcUrl;
  return new JsonRpcProvider(url, cfg.chainId);
}

export async function getEthBalance(
  address: string,
  network: NetworkKey,
  rpcUrl?: string,
): Promise<{ wei: bigint; eth: string }> {
  const provider = createProvider(network, rpcUrl);
  const wei = await provider.getBalance(address);
  return { wei, eth: formatEther(wei) };
}

export async function getErc20Balance(
  tokenAddress: string,
  holder: string,
  network: NetworkKey,
  rpcUrl?: string,
): Promise<{ raw: bigint; formatted: string; symbol: string; decimals: number }> {
  const provider = createProvider(network, rpcUrl);
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const [raw, decimals, symbol] = await Promise.all([
    token.balanceOf(holder) as Promise<bigint>,
    token.decimals() as Promise<number>,
    token.symbol() as Promise<string>,
  ]);
  return {
    raw,
    decimals: Number(decimals),
    symbol,
    formatted: formatUnits(raw, decimals),
  };
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals);
}

export { ERC20_ABI };
