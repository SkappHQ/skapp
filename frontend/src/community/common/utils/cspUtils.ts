export const CSP_HEADER_NAME = "Content-Security-Policy";
export const NONCE_HEADER_NAME = "x-nonce";

const isDevelopment = process.env.NODE_ENV === "development";

export const generateNonce = (): string =>
  Buffer.from(crypto.randomUUID()).toString("base64");

export const buildContentSecurityPolicy = (nonce: string): string =>
  [
    `script-src 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "worker-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ]
    .filter(Boolean)
    .join("; ");
