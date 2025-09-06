// Simple AES-GCM encryption/decryption helpers using Web Crypto API
// Uses VITE_ENCRYPTION_KEY from env as the passphrase; derives a 256-bit key via SHA-256

const enc = new TextEncoder();
const dec = new TextDecoder();

const getSecret = (): string => {
  // Vite exposes envs under import.meta.env
  const secret = import.meta.env.VITE_ENCRYPTION_KEY as string | undefined;
  if (!secret || secret.length === 0) {
    throw new Error(
      "Missing VITE_ENCRYPTION_KEY. Define it in your .env (see .env.example)."
    );
  }
  return secret;
};

let cachedKey: CryptoKey | null = null;

async function deriveKeyFromSecret(secret: string): Promise<CryptoKey> {
  // Hash the secret to 32 bytes and use as raw AES-GCM key
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = getSecret();
  cachedKey = await deriveKeyFromSecret(secret);
  return cachedKey;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV length
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(
    iv.byteLength + (ciphertext as ArrayBuffer).byteLength
  );
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext as ArrayBuffer), iv.byteLength);
  return toBase64(combined);
}

export async function decryptString(payload: string): Promise<string> {
  const key = await getKey();
  const combined = fromBase64(payload);
  if (combined.byteLength < 13) {
    throw new Error("Invalid payload for decryption");
  }
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return dec.decode(plaintext);
}

export async function tryDecryptString(payload: string): Promise<string> {
  try {
    return await decryptString(payload);
  } catch {
    // Fallback for any legacy unencrypted values
    return payload;
  }
}
