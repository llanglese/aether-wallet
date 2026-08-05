import { Wallet, type HDNodeWallet } from "ethers";

/**
 * Encrypt a private key into an Ethereum Keystore V3 JSON string (password-based).
 * Decryption requires the same password — never store plaintext keys.
 */
export async function encryptPrivateKeyToKeystore(
  privateKey: string,
  password: string,
): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("password must be at least 8 characters");
  }
  const wallet = new Wallet(privateKey);
  return wallet.encrypt(password);
}

export async function decryptKeystoreToWallet(
  keystoreJson: string,
  password: string,
): Promise<Wallet | HDNodeWallet> {
  return Wallet.fromEncryptedJson(keystoreJson, password);
}

export async function decryptKeystoreToPrivateKey(
  keystoreJson: string,
  password: string,
): Promise<string> {
  const wallet = await decryptKeystoreToWallet(keystoreJson, password);
  return wallet.privateKey;
}
