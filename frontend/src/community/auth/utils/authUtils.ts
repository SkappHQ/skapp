import { unitConversion } from "~community/common/constants/configs";
import {
  AdminTypes,
  AuthEmployeeType,
  EmployeeTypes,
  ManagerTypes,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import {
  EnterpriseSignInParams,
  EnterpriseSignUpParams,
  enterpriseSignIn,
  enterpriseSignUp
} from "~enterprise/auth/utils/authUtils";
import { authenticationEndpoints } from "~enterprise/common/api/utils/ApiEndpoints";
import { TenantStatusEnums, TierEnum } from "~enterprise/common/enums/Common";

import {
  config,
  drawerHiddenProtectedRoutes,
  routeMatchers
} from "../constants/routeConfigs";
import { SignInStatus } from "../enums/auth";
import authAxios from "./authInterceptor";

// Helper function to match a path against a route pattern
export const matchesRoutePattern = (
  pathname: string,
  pattern: string
): boolean => {
  // Convert pattern to regex (e.g., "/path/:param" -> "/path/[^/]+")
  const regexPattern = pattern
    .replace(/:[^/]+/g, "[^/]+") // Replace :param with [^/]+
    .replace(/\*/g, ".*"); // Replace * with .*
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
};

export const isProtectedRoute = (pathname: string): boolean => {
  return routeMatchers.some((pattern) =>
    matchesRoutePattern(pathname, pattern)
  );
};

export const IsAProtectedUrlWithDrawer = (asPath: string): boolean => {
  const isADrawerHiddenProtectedRoute = drawerHiddenProtectedRoutes.some(
    (prefix) => {
      return asPath.startsWith(prefix);
    }
  );

  if (!isADrawerHiddenProtectedRoute) {
    const formattedProtectedPaths = config.matcher.map((path) =>
      path.replace(/\/:path\*$/, "")
    );

    return formattedProtectedPaths.some((path) => {
      return (
        asPath.substring(1).split("/")[0].split("?")[0] === path.split("/")[1]
      );
    });
  }

  return false;
};

export const decodeJWTToken = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const decodedToken = JSON.parse(atob(base64));
  return decodedToken;
};

export interface User {
  userId?: number;
  email?: string;
  name?: string;
  roles?: (
    | AdminTypes
    | ManagerTypes
    | EmployeeTypes
    | SuperAdminType
    | SenderTypes
  )[];
  accessToken?: string;
  refreshToken?: string;
  tokenDuration?: number;
  isPasswordChangedForTheFirstTime?: boolean;
  employee?: AuthEmployeeType;
  tier?: TierEnum;
  tenantId?: string;
  tenantStatus?: TenantStatusEnums;
  isTemporaryUser?: boolean;
}

// Flag to prevent recursive token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const getNewAccessToken = async (): Promise<string | null> => {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await authAxios.post(
        authenticationEndpoints.REFRESH_TOKEN,
        {},
        { withCredentials: true }
      );

      const accessToken = response?.data?.results[0]?.accessToken;

      if (accessToken) {
        setAccessToken(accessToken);
        return accessToken;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

export const clearCookies = async (): Promise<void> => {
  if (typeof window !== "undefined") {
    // Clear httpOnly cookies by setting them to expire
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; Secure; SameSite=Strict";
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const currentAccessToken = localStorage.getItem("accessToken");

  if (!currentAccessToken) {
    return null;
  }

  if (isTokenExpired(currentAccessToken)) {
    const newToken = await getNewAccessToken();
    return newToken;
  }

  return currentAccessToken;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const claims = extractClaimsFromToken(token);

    return (
      Date.now() >
      (claims?.exp as number) * unitConversion.MILLISECONDS_PER_SECOND
    );
  } catch (error) {
    console.error("Failed to parse token:", error);
    return true;
  }
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

export const extractUserFromToken = (token: string): User | null => {
  try {
    if (isTokenExpired(token)) {
      return null;
    }

    const claims = extractClaimsFromToken(token);

    return {
      userId: claims?.userId,
      email: claims?.email,
      name: claims?.employee
        ? `${claims.employee.firstName} ${claims.employee.lastName || ""}`
        : "",
      roles: claims?.roles as (
        | AdminTypes
        | ManagerTypes
        | EmployeeTypes
        | SuperAdminType
        | SenderTypes
      )[],
      accessToken: token,
      tokenDuration: claims?.tokenDuration,
      isPasswordChangedForTheFirstTime:
        claims?.isPasswordChangedForTheFirstTime ?? true,
      employee: claims?.employee,
      tier: claims?.tier as TierEnum,
      tenantId: claims?.tenantId,
      tenantStatus: claims?.tenantStatus,
      isTemporaryUser: claims?.isTemporaryUser ?? false
    };
  } catch (error) {
    console.error("Failed to extract user from token:", error);
    return null;
  }
};

export const communitySignIn = async (_email: string, _password: string) => {};

export const handleSignIn = async (
  params: EnterpriseSignInParams
): Promise<SignInStatus> => {
  const response = await enterpriseSignIn(params);
  return response;
};

export const handleSignUp = async (
  params: EnterpriseSignUpParams
): Promise<SignInStatus> => {
  const response = await enterpriseSignUp(params);
  return response;
};

export const checkUserAuthentication = async (): Promise<User | null> => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const userData = extractUserFromToken(token);
  
  return userData;
};
