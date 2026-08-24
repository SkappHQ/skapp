import { unitConversion } from "~community/common/constants/configs";

export const decodeJWTToken = (token: string) => {
  const base64Url = token?.split(".")[1];

  if (!base64Url) return null;

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const decodedToken = JSON.parse(atob(base64));
  return decodedToken;
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

export const isTokenExpired = (token: string): boolean => {
  try {
    const exp = extractClaimsFromToken(token)?.exp as number | undefined;

    if (!exp) return true;

    return Date.now() > exp * unitConversion.MILLISECONDS_PER_SECOND;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return true;
  }
};

export const getTokenMaxAgeSeconds = (token: string): number => {
  const exp = extractClaimsFromToken(token)?.exp as number | undefined;

  if (!exp) return 0;

  const secondsUntilExpiry = Math.floor(
    exp - Date.now() / unitConversion.MILLISECONDS_PER_SECOND
  );

  return Math.max(secondsUntilExpiry, 0);
};
