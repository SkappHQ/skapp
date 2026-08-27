import { useRouter } from "next/router";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { internalApiEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  EnterpriseSignInParams,
  EnterpriseSignUpParams
} from "~enterprise/auth/utils/authUtils";

import FullScreenLoader from "../../common/components/molecules/FullScreenLoader/FullScreenLoader";
import { SignInStatus } from "../enums/auth";
import { AuthContextType, AuthResponseType } from "../types/auth";
import {
  User,
  checkUserAuthentication,
  handleSignIn,
  handleSignUp,
  resolvePostSignInPath
} from "../utils/authUtils";

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

  // Use ref to track if initial auth check is done
  const initialCheckDone = useRef(false);
  const isCheckingAuth = useRef(false);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<User | null> => {
    if (isCheckingAuth.current) return null;
    isCheckingAuth.current = true;
    setIsLoading(true);

    try {
      const userData = await checkUserAuthentication();

      setUser(userData);
      setIsAuthenticated(!!userData);

      return userData;
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
      initialCheckDone.current = true;
    }
  }, []);

  const signUp = useCallback(
    async (params: EnterpriseSignUpParams): Promise<AuthResponseType> => {
      try {
        const response = await handleSignUp(params);

        if (response.status === SignInStatus.SUCCESS) {
          await checkAuth();
        }

        return response;
      } catch (error) {
        console.error("Signup error");
        throw error;
      }
    },
    [checkAuth]
  );

  // Sign In function
  const signIn = useCallback(
    async (params: EnterpriseSignInParams): Promise<AuthResponseType> => {
      try {
        // Clear all existing cookies and the in memory token before signing in
        useCommonStore.getState().clearAccessToken();

        await fetch(internalApiEndpoints.CLEAR_COOKIES, {
          method: "POST"
        });

        const response = await handleSignIn(params);

        if (response.status === SignInStatus.SUCCESS) {
          setIsLoading(true);
          // Refresh auth state after successful sign in
          const userData = await checkAuth();

          if (params.redirect) {
            if (userData) {
              window.location.href = resolvePostSignInPath(
                router.query.callback,
                router.asPath.split("?")[0]
              );
            } else {
              console.error("Access token not available after sign-in");
              throw new Error(
                "Authentication was not established after sign-in"
              );
            }
          }
        }

        return response;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [router, checkAuth]
  );

  // Initial authentication check on mount
  useEffect(() => {
    if (!initialCheckDone.current) {
      checkAuth();
    }
  }, [checkAuth]);

  const value: AuthContextType = {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signUp,
    checkAuth
  };

  // Show loading state during initial authentication check
  if (!initialCheckDone.current || isLoading) {
    return <FullScreenLoader />;
  } else {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }
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
