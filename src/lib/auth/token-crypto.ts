import "server-only";
import crypto from "crypto";

const VERSION = "v1";
const IV_BYTES = 12;
const KEY_BYTES = 32;
const ALGO = "aes-256-gcm";

let cachedKey: Buffer | null = null;
let warnedDevKey = false;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.NEXUS_TOKEN_ENCRYPTION_KEY;
  if (raw) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length !== KEY_BYTES) {
      throw new Error(
        `NEXUS_TOKEN_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes, got ${buf.length}`
      );
    }
    cachedKey = buf;
    return buf;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXUS_TOKEN_ENCRYPTION_KEY is required in production"
    );
  }
  if (!warnedDevKey) {
    console.warn(
      "[token-crypto] NEXUS_TOKEN_ENCRYPTION_KEY missing — using a dev-only key. Do not use in production."
    );
    warnedDevKey = true;
  }
  // Deterministic 32-byte dev key derived from a fixed string. NOT secure.
  cachedKey = crypto.createHash("sha256").update("nexus-dev-key").digest();
  return cachedKey;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${VERSION}:`);
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decryptToken(stored: string): string {
  if (!isEncrypted(stored)) return stored; // legacy plaintext passthrough
  const parts = stored.split(":");
  if (parts.length !== 4) throw new Error("malformed encrypted token");
  const [, ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
