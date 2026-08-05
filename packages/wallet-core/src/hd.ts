import { HDNodeWallet, Mnemonic, Wallet, hexlify } from "ethers";

export interface DerivedAccount {
  index: number;
  path: string;
  address: string;
  privateKey: string;
}

/** BIP44 Ethereum path: m/44'/60'/0'/0/{index} */
export function ethAccountPath(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("account index must be a non-negative integer");
  }
  return `m/44'/60'/0'/0/${index}`;
}

function randomEntropy(bytes: number): Uint8Array {
  const out = new Uint8Array(bytes);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(out);
    return out;
  }
  throw new Error("secure random generator is not available");
}

/** Create a new 12-word English mnemonic. */
export function createMnemonic(): string {
  return Mnemonic.fromEntropy(hexlify(randomEntropy(16))).phrase;
}

export function validateMnemonic(phrase: string): boolean {
  try {
    Mnemonic.fromPhrase(phrase.trim());
    return true;
  } catch {
    return false;
  }
}

export function deriveAccount(mnemonic: string, index = 0): DerivedAccount {
  const phrase = mnemonic.trim();
  if (!validateMnemonic(phrase)) {
    throw new Error("invalid mnemonic phrase");
  }
  const path = ethAccountPath(index);
  const wallet = HDNodeWallet.fromPhrase(phrase, undefined, path);
  return {
    index,
    path,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export function walletFromPrivateKey(privateKey: string): Wallet {
  return new Wallet(privateKey);
}

export function exportPrivateKey(mnemonic: string, index = 0): string {
  return deriveAccount(mnemonic, index).privateKey;
}
