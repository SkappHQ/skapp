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

import { EnterpriseSignInParams } from "~enterprise/auth/utils/authUtils";

import FullScreenLoader from "../../common/components/molecules/FullScreenLoader/FullScreenLoader";
import ROUTES from "../../common/constants/routes";
import { SignInStatus } from "../enums/auth";
import { AuthContextType } from "../types/auth";
import {
  User,
  checkUserAuthentication,
  getNewAccessToken,
  handleSignIn,
  isProtectedRoute
} from "../utils/authUtils";
import { validateRouteAccess } from "../utils/routeGuards";

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

  const signOut = useCallback(async (redirect?: boolean) => {
    try {
      setIsLoading(true);
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);

      if (redirect) {
        return;
      } else if (router.asPath !== ROUTES.AUTH.SIGNIN) {
        const existingCallback = router.query.callback as string;
        const callbackPath = existingCallback || router.asPath;
        router.push(ROUTES.AUTH.SIGNIN + `?callback=${callbackPath}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        await signOut();
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
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

  // Sign In function
  const signIn = useCallback(
    async (params: EnterpriseSignInParams): Promise<SignInStatus> => {
      try {
        setIsLoading(true);

        const response = await handleSignIn(params);

        // Refresh auth state after successful sign in
        await checkAuth();

        if (params.redirect) {
          const redirectPath =
            (router.query.callback as string) || ROUTES.DASHBOARD.BASE;
          router.push(redirectPath);
        }

        return response;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
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

  useEffect(() => {
    if (!initialCheckDone.current || isLoading) return;

    const currentPath = router.pathname;

    if (!isProtectedRoute(currentPath)) {
      return;
    }

    if (!isAuthenticated) {
      signOut();
      return;
    }

    if (user) {
      validateRouteAccess(user, currentPath, router);
    }
  }, [isAuthenticated, isLoading, user, router.pathname]);

  const value: AuthContextType = {
    isLoading,
    isAuthenticated,
    user,
    signIn,
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
