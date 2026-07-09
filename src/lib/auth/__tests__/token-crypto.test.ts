import { describe, it, expect, beforeAll } from "vitest";
import { encryptToken, decryptToken, isEncrypted } from "../token-crypto";

describe("token-crypto", () => {
  beforeAll(() => {
    process.env.NEXUS_TOKEN_ENCRYPTION_KEY =
      Buffer.alloc(32, 7).toString("base64");
  });

  it("round-trips a token", () => {
    const plain = "ya29.a0AfH6SMx...";
    const stored = encryptToken(plain);
    expect(isEncrypted(stored)).toBe(true);
    expect(stored.startsWith("v1:")).toBe(true);
    expect(decryptToken(stored)).toBe(plain);
  });

  it("returns plaintext unchanged for legacy values", () => {
    const legacy = "ya29.legacy.token";
    expect(isEncrypted(legacy)).toBe(false);
    expect(decryptToken(legacy)).toBe(legacy);
  });

  it("rejects tampered ciphertext", () => {
    const stored = encryptToken("secret");
    const tampered = stored.replace(/^v1:/, "v1:") + "AAAA";
    // Flip a base64 char in the tag
    const tampered2 = stored.slice(0, -4) + "AAAA";
    expect(() => decryptToken(tampered2)).toThrow();
  });
});
