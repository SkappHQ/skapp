// Token utility functions for client-side

export interface DecodedToken {
  exp: number;
  iat: number;
  userId?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Decode JWT token (client-side safe, no verification)
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // Add 60 second buffer to refresh before actual expiry
  const expiryTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = 60 * 1000; // 60 seconds

  return currentTime >= expiryTime - bufferTime;
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  const expiryTime = decoded.exp * 1000;
  const currentTime = Date.now();
  return Math.max(0, expiryTime - currentTime);
}

/**
 * Storage keys
 */
export const TOKEN_STORAGE_KEY = "skapp-access-token";
export const USER_STORAGE_KEY = "skapp-user-data";

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Get user data from localStorage
 */
export function getUserData(): any {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Set user data in localStorage
 */
export function setUserData(user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
export function removeUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  removeAccessToken();
  removeUserData();
}
