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
  SignInStatus,
  User,
  enterpriseSignIn,
  extractUserFromToken,
  getAccessToken
} from "~enterprise/auth/utils/authUtils";

import ROUTES from "../constants/routes";

// Types
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (params: EnterpriseSignInParams) => Promise<SignInStatus>;
  signOut: (redirect?: boolean) => Promise<void>;
  refreshAccessToken: () => Promise<SignInStatus>;
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
  const [user, setUser] = useState<User | null>(null);
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
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = extractUserFromToken(token);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Access Token function
  const refreshAccessToken = async (): Promise<SignInStatus> => {
    // TODO: Implement refresh token logic
    return SignInStatus.SUCCESS;
  };

  // Sign In function
  const signIn = async (
    params: EnterpriseSignInParams
  ): Promise<SignInStatus> => {
    try {
      setIsLoading(true);

      const response = await enterpriseSignIn({
        email: params.email,
        password: params.password,
        method: AuthMethods.CREDENTIAL
      });

      if (response !== SignInStatus.SUCCESS) {
        throw new Error("Login failed");
      } else {
        if (params.redirect) {
          router.push(
            (router.query.redirect as string) || ROUTES.DASHBOARD.BASE
          );
        }
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out function
  const signOut = async (redirect?: boolean) => {
    try {
      setIsLoading(true);

      localStorage.removeItem("accessToken");

      setUser(null);
      setIsAuthenticated(false);

      if (!redirect) {
        return;
      } else {
        router.push(ROUTES.AUTH.SIGNIN);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isLoading,
    isAuthenticated: isAuthenticated,
    user,
    signIn,
    signOut,
    refreshAccessToken
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

export default AuthProvider;
