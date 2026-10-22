export const CSP_HEADER_NAME = "Content-Security-Policy";
export const NONCE_HEADER_NAME = "x-nonce";

const isDevelopment = process.env.NODE_ENV === "development";

export const generateNonce = (): string =>
  Buffer.from(crypto.randomUUID()).toString("base64");

const getApiOrigins = (): string[] =>
  [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_PM_API_URL]
    .filter((url): url is string => Boolean(url))
    .flatMap((url) => {
      try {
        const { origin } = new URL(url);
        return [origin, origin.replace(/^http/, "ws")];
      } catch {
        return [];
      }
    });

export const buildContentSecurityPolicy = (nonce: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.googletagmanager.com https://*.contentsquare.net https://connect.facebook.net https://www.google.com https://www.gstatic.com https://*.firebaseio.com${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    [
      "connect-src 'self'",
      ...getApiOrigins(),
      "https://*.amazonaws.com",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
      "https://*.firebasedatabase.app",
      "wss://*.firebasedatabase.app",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      "https://*.doubleclick.net",
      "https://www.google.com",
      "https://*.contentsquare.net",
      "https://*.contentsquare.com",
      "https://*.hotjar.com",
      "https://*.hotjar.io",
      "wss://*.hotjar.com",
      "https://www.facebook.com",
      isDevelopment ? "ws:" : ""
    ]
      .filter(Boolean)
      .join(" "),
    "worker-src 'self' blob: https://cdnjs.cloudflare.com",
    "frame-src 'self' blob: https://www.googletagmanager.com https://www.google.com https://recaptcha.google.com https://*.firebaseio.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isDevelopment ? "" : "upgrade-insecure-requests"
  ]
    .filter(Boolean)
    .join("; ");
