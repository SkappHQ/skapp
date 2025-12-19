// Edge-compatible encryption utilities using Web Crypto API

/**
 * Encrypt data for Edge runtime compatibility
 * Uses Web Crypto API instead of Node.js crypto
 */
export async function encryptEdge(text: string, key: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Generate key from password
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key.padEnd(32, "0").slice(0, 32)),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("skapp-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

/**
 * Decrypt data for Edge runtime compatibility
 */
export async function decryptEdge(
  encryptedText: string,
  key: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();

    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedText), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Generate key from password
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key.padEnd(32, "0").slice(0, 32)),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("skapp-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
}
