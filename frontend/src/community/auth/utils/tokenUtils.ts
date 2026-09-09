import { unitConversion } from "~community/common/constants/configs";

export const decodeJWTToken = (
  token: string
): Record<string, unknown> | null => {
  const base64Url = token?.split(".")[1];

  if (!base64Url) return null;

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  return JSON.parse(atob(base64));
};

export const extractClaimsFromToken = (token: string): Record<string, any> => {
  try {
    const claims = decodeJWTToken(token);
    return claims || {};
  } catch (error) {
    console.error("Failed to parse token:", error);
    return {};
  }
};

const getExpiryInSeconds = (token: string): number | null => {
  const exp = extractClaimsFromToken(token)?.exp;

  if (typeof exp !== "number" || !Number.isFinite(exp)) return null;

  return exp;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const exp = getExpiryInSeconds(token);

    if (exp === null) return true;

    return Date.now() > exp * unitConversion.MILLISECONDS_PER_SECOND;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return true;
  }
};

export const getTokenMaxAgeSeconds = (token: string): number => {
  const exp = getExpiryInSeconds(token);

  if (exp === null) return 0;

  const secondsUntilExpiry = Math.floor(
    exp - Date.now() / unitConversion.MILLISECONDS_PER_SECOND
  );

  return Math.max(secondsUntilExpiry, 0);
};
