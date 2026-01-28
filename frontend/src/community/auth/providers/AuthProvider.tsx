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

import {
  EnterpriseSignInParams,
  EnterpriseSignUpParams
} from "~enterprise/auth/utils/authUtils";

import FullScreenLoader from "../../common/components/molecules/FullScreenLoader/FullScreenLoader";
import ROUTES from "../../common/constants/routes";
import { SignInStatus } from "../enums/auth";
import { AuthContextType, AuthResponseType } from "../types/auth";
import {
  User,
  checkUserAuthentication,
  clearCookies,
  getNewAccessToken,
  handleSignIn,
  handleSignUp
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

  const signOut = useCallback(
    async (redirect?: boolean) => {
      try {
        setIsLoading(true);
        await clearCookies();

        if (redirect === false) {
          return;
        } else if (router.asPath !== ROUTES.AUTH.SIGNIN) {
          await router.push(ROUTES.AUTH.SIGNIN);
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Check authentication status
  const checkAuth = useCallback(async () => {
    // Prevent duplicate checks
    if (isCheckingAuth.current) return;

    try {
      isCheckingAuth.current = true;
      setIsLoading(true);

      const userData = await checkUserAuthentication();

      if (!userData) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      await signOut();
    } finally {
      isCheckingAuth.current = false;
      initialCheckDone.current = true;
    }
  }, [signOut]);

  // Refresh Access Token function
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    return await getNewAccessToken();
  }, []);

  const signUp = useCallback(
    async (params: EnterpriseSignUpParams): Promise<AuthResponseType> => {
      try {
        const response = await handleSignUp(params);

        if (response.status === SignInStatus.SUCCESS) {
          setIsLoading(true);
          await checkAuth();
        }

        return response;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [checkAuth]
  );

  // Sign In function
  const signIn = useCallback(
    async (params: EnterpriseSignInParams): Promise<AuthResponseType> => {
      try {
        const response = await handleSignIn(params);

        if (response.status === SignInStatus.SUCCESS) {
          setIsLoading(true);
          // Refresh auth state after successful sign in
          await checkAuth();

          if (params.redirect) {
            const redirectPath =
              (router.query.callback as string) || ROUTES.DASHBOARD.BASE;
            router.push(redirectPath);
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
    signOut,
    refreshAccessToken
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
