import {
  EnterpriseSignInParams,
  User,
  enterpriseSignIn,
  extractUserFromToken,
  getAccessToken,
  setAccessToken
} from "~enterprise/auth/utils/authUtils";
import epAuthFetch from "~enterprise/common/utils/axiosInterceptor";

import {
  config,
  drawerHiddenProtectedRoutes,
  routeMatchers
} from "../constants/routeConfigs";
import { AuthMethods, SignInStatus } from "../enums/auth";

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

export const communitySignIn = async (email: string, password: string) => {};

export const handleSignIn = async (
  params: EnterpriseSignInParams
): Promise<SignInStatus> => {
  const response = await enterpriseSignIn({
    email: params.email,
    password: params.password,
    method: AuthMethods.CREDENTIAL
  });

  if (response !== SignInStatus.SUCCESS) {
    throw new Error("Login failed");
  }

  return response;
};

export const checkUserAuthentication = async (): Promise<User | null> => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const userData = extractUserFromToken(token);

  if (!userData) {
    localStorage.removeItem("accessToken");
    return null;
  }

  return userData;
};

export const handleRefreshToken = async (): Promise<SignInStatus> => {
  const response = await epAuthFetch.post("/v1/auth/refresh-token/cookie", {
    withCredentials: true
  });

  const accessToken = response?.data?.results[0]?.accessToken;

  if (accessToken) {
    setAccessToken(accessToken);

    return SignInStatus.SUCCESS;
  } else {
    return SignInStatus.FAILURE;
  }
};
