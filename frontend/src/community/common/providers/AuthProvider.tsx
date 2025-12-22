import { useRouter } from "next/router";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  AuthMethods,
  EnterpriseSignInParams,
  enterpriseSignIn,
  getAccessToken
} from "~enterprise/auth/utils/authUtils";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (params: EnterpriseSignInParams) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);

      const token = getAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In function
  const signIn = async (params: EnterpriseSignInParams) => {
    try {
      setIsLoading(true);

      const response = await enterpriseSignIn({
        email: params.email,
        password: params.password,
        method: AuthMethods.CREDENTIAL
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Store token
      localStorage.setItem("accessToken", data.token);

      // Redirect to dashboard or intended page
      const redirectUrl =
        (router.query.redirect as string) || "/community/dashboard";
      router.push(redirectUrl);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out function
  const signOut = async () => {
    try {
      setIsLoading(true);

      // Call logout API endpoint
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Clear local storage
      localStorage.removeItem("authToken");

      // Redirect to login
      router.push("/community/signin");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isLoading,
    isAuthenticated: isAuthenticated,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(`/community/signin?redirect=${router.asPath}`);
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
          }}
        >
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

export default AuthProvider;
