import { Wallet, verifyMessage } from "ethers";

/**
 * EIP-191 personal_sign: sign an arbitrary UTF-8 message with a private key.
 */
export async function signPersonalMessage(input: {
  privateKey: string;
  message: string;
}): Promise<{ signature: string; address: string; message: string }> {
  if (!input.message) throw new Error("message is required");
  const wallet = new Wallet(input.privateKey);
  const signature = await wallet.signMessage(input.message);
  return {
    signature,
    address: wallet.address,
    message: input.message,
  };
}

/**
 * Recover the signer address from an EIP-191 signature.
 */
export function recoverPersonalMessageSigner(
  message: string,
  signature: string,
): string {
  return verifyMessage(message, signature);
}
