/**
 * Extracts the registrable domain from a URL or bare domain string.
 * Examples:
 *   "https://www.example.com/about" → "example.com"
 *   "example.com"                   → "example.com"
 *   "www.example.com"               → "example.com"
 *   ""                              → null
 */
export const extractDomain = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let hostname: string;

  try {
    const withProtocol = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;
    hostname = new URL(withProtocol).hostname;
  } catch {
    hostname = trimmed.split("/")[0];
  }

  // Strip leading "www." to normalise
  hostname = hostname.replace(/^www\./i, "");

  // Must contain at least one dot to be a valid domain
  if (!hostname || !hostname.includes(".")) return null;

  return hostname.toLowerCase();
};
