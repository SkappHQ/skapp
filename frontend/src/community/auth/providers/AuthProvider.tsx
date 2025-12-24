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

import { EnterpriseSignInParams, User } from "~enterprise/auth/utils/authUtils";

import FullScreenLoader from "../../common/components/molecules/FullScreenLoader/FullScreenLoader";
import ROUTES from "../../common/constants/routes";
import { SignInStatus } from "../enums/auth";
import {
  checkUserAuthentication,
  handleRefreshToken,
  handleSignIn
} from "../utils/authUtils";
import { validateRouteAccess } from "../utils/routeGuards";
import { AuthContextType } from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/forget-password",
  "/reset-password"
];

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
};

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
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsAuthenticated(false);

        if (redirect) {
          router.push(ROUTES.AUTH.SIGNIN);
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
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
      initialCheckDone.current = true;
    }
  }, []);

  // Refresh Access Token function
  const refreshAccessToken = useCallback(async (): Promise<SignInStatus> => {
    return await handleRefreshToken();
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
            (router.query.redirect as string) || ROUTES.DASHBOARD.BASE;
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

  // Handle route protection - only run when auth state changes or route changes
  useEffect(() => {
    // Skip if still loading initial auth check
    if (!initialCheckDone.current || isLoading) return;

    const currentPath = router.pathname;

    // Allow public routes
    if (isPublicRoute(currentPath)) {
      return;
    }

    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
      router.replace(ROUTES.AUTH.SIGNIN);
      return;
    }

    // Validate route access based on user permissions
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
  }

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
