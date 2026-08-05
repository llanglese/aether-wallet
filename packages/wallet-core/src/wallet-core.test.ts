import { describe, expect, it } from "vitest";
import {
  createMnemonic,
  decryptKeystoreToPrivateKey,
  deriveAccount,
  encryptPrivateKeyToKeystore,
  ethAccountPath,
  exportPrivateKey,
  validateMnemonic,
  DEMO_SEPOLIA_ADDRESS,
  NETWORKS,
} from "./index.js";

describe("hd wallet", () => {
  it("creates a valid 12-word mnemonic", () => {
    const phrase = createMnemonic();
    expect(phrase.split(" ")).toHaveLength(12);
    expect(validateMnemonic(phrase)).toBe(true);
  });

  it("derives deterministic addresses for the same mnemonic", () => {
    const phrase =
      "test test test test test test test test test test test junk";
    const a = deriveAccount(phrase, 0);
    const b = deriveAccount(phrase, 0);
    expect(a.address).toBe(b.address);
    expect(a.path).toBe(ethAccountPath(0));
    expect(a.privateKey).toBe(exportPrivateKey(phrase, 0));
  });

  it("uses different addresses for different indices", () => {
    const phrase =
      "test test test test test test test test test test test junk";
    const a0 = deriveAccount(phrase, 0);
    const a1 = deriveAccount(phrase, 1);
    expect(a0.address).not.toBe(a1.address);
  });
});

describe("keystore", () => {
  it("encrypts and decrypts a private key", async () => {
    const phrase =
      "test test test test test test test test test test test junk";
    const { privateKey, address } = deriveAccount(phrase, 0);
    const json = await encryptPrivateKeyToKeystore(privateKey, "password123");
    expect(json.toLowerCase()).toContain("crypto");
    const restored = await decryptKeystoreToPrivateKey(json, "password123");
    expect(restored.toLowerCase()).toBe(privateKey.toLowerCase());
    expect(deriveAccount(phrase, 0).address).toBe(address);
  }, 30_000);
});

describe("networks", () => {
  it("exposes sepolia and mainnet configs", () => {
    expect(NETWORKS.sepolia.chainId).toBe(11155111);
    expect(NETWORKS.mainnet.chainId).toBe(1);
    expect(DEMO_SEPOLIA_ADDRESS.startsWith("0x")).toBe(true);
  });
});

describe("tx history helpers", () => {
  it("returns empty history when localStorage is unavailable", async () => {
    const { loadTxHistory } = await import("./txHistory.js");
    expect(loadTxHistory()).toEqual([]);
  });
});

describe("tx history helpers", () => {
  it("returns empty history when localStorage is unavailable", async () => {
    const { loadTxHistory } = await import("./txHistory.js");
    expect(loadTxHistory()).toEqual([]);
  });
});
