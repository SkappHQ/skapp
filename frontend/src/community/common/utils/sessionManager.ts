import {
  CustomSession,
  CustomUser
} from "~community/common/types/AuthTypes.custom";
import { decodeJWTToken } from "~community/common/utils/authUtils";

export const sessionManager = {
  /**
   * Get session from cookies
   */
  getSession: async (): Promise<CustomSession | null> => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        return null;
      }

      const session = await response.json();
      return session || null;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  /**
   * Set session by calling the signin API
   */
  setSession: async (_user: CustomUser): Promise<void> => {
    // Session is set via HTTP-only cookies in the API route
    // This is just for client-side state management
  },

  /**
   * Clear session
   */
  clearSession: async (): Promise<void> => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  },

  /**
   * Refresh session token
   */
  refreshSession: async (): Promise<CustomSession | null> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        return null;
      }

      const session = await response.json();
      return session || null;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  },

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired: (tokenDuration: number | undefined): boolean => {
    if (!tokenDuration) return true;

    const now = Date.now();
    const expirationTime = tokenDuration * 1000; // Convert to milliseconds
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return now >= expirationTime - bufferTime;
  },

  /**
   * Decode JWT token and extract user data
   */
  decodeToken: (token: string): any => {
    try {
      return decodeJWTToken(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  /**
   * Calculate session expiry
   */
  getSessionExpiry: (maxAge: number = 86400): string => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + maxAge * 1000);
    return expiryDate.toISOString();
  }
};
