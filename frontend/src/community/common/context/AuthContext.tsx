import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  AuthContextValue,
  CustomSession,
  SessionStatus,
  SignInCredentials,
  SignInOptions,
  SignInResponse,
  SignOutOptions
} from "~community/common/types/AuthTypes.custom";
import {
  clearAuthData,
  getAccessToken,
  getUserData,
  isTokenExpired,
  removeAccessToken,
  removeUserData,
  setAccessToken,
  setUserData
} from "~community/common/utils/tokenUtils";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  session?: CustomSession | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  session: initialSession
}) => {
  const [session, setSession] = useState<CustomSession | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const token = getAccessToken();
      const user = getUserData();
      if (token && user && !isTokenExpired(token)) {
        return { user, expires: "" };
      }
    }
    return initialSession || null;
  });
  const [status, setStatus] = useState<SessionStatus>("loading");

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.user) {
          setUserData(data.user);
          setSession({ user: data.user, expires: "" });
          setStatus("authenticated");
        }
        return data.accessToken;
      }

      return null;
    } catch (error) {
      console.error("[AuthProvider] Token refresh error:", error);
      clearAuthData();
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  const updateSession = useCallback(async () => {
    try {
      // Check if we have a valid token in localStorage first
      const token = getAccessToken();
      const user = getUserData();

      if (token && user) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Try to refresh
          const newToken = await refreshToken();
          if (!newToken) {
            setSession(null);
            setStatus("unauthenticated");
            return;
          }
        } else {
          setSession({ user, expires: "" });
          setStatus("authenticated");
          return;
        }
      }

      // Fall back to session API only if localStorage is empty
      const response = await fetch("/api/auth/session", {
        credentials: "include"
      });

      if (!response.ok) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }

      const newSession = await response.json();

      if (newSession && newSession.user) {
        setSession(newSession);
        setStatus("authenticated");
        // Don't store in localStorage here since we don't have the access token
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("[AuthProvider] Error updating session:", error);
      setSession(null);
      setStatus("unauthenticated");
    }
  }, [refreshToken]);

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      const token = getAccessToken();
      const user = getUserData();

      if (token && user && !isTokenExpired(token)) {
        setSession({ user, expires: "" });
        setStatus("authenticated");
      } else {
        await updateSession();
      }
    };

    checkSession();
  }, []); // Only run once on mount

  // Auto-refresh token before expiration
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const checkAndRefresh = async () => {
      if (isTokenExpired(token)) {
        await refreshToken();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkAndRefresh, 30 * 1000);

    return () => clearInterval(interval);
  }, [session, refreshToken]);

  const contextValue: AuthContextValue = {
    data: session,
    status,
    update: updateSession,
    refreshToken // Expose refresh function
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom hook to access auth context
 * Replaces NextAuth's useSession hook
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Sign in function
 * Replaces NextAuth's signIn function
 */
export const signIn = async (
  provider: string,
  credentials?: SignInCredentials & SignInOptions
): Promise<SignInResponse> => {
  try {
    const { redirect = true, callbackUrl, ...creds } = credentials || {};

    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        provider,
        ...creds
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || "Authentication failed",
        status: response.status,
        ok: false
      };
    }

    // Store access token and user data in localStorage
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    if (data.user) {
      setUserData(data.user);
    }

    // Trigger page reload or redirect if needed
    if (redirect !== false) {
      const url = callbackUrl || data.url || "/dashboard";
      window.location.href = url;
      return {
        status: 200,
        ok: true,
        url
      };
    }

    return {
      status: 200,
      ok: true
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error: "An unexpected error occurred",
      status: 500,
      ok: false
    };
  }
};

/**
 * Sign out function
 * Replaces NextAuth's signOut function
 */
export const signOut = async (options?: SignOutOptions): Promise<void> => {
  try {
    // Clear localStorage
    clearAuthData();

    // Call signout API to clear cookies
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include"
    });

    if (options?.redirect !== false) {
      const url = options?.callbackUrl || "/signin";
      window.location.href = url;
    }
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

/**
 * Get session function for server-side or client-side use
 * Replaces NextAuth's getSession function
 */
export const getSession = async (): Promise<CustomSession | null> => {
  return await sessionManager.getSession();
};
