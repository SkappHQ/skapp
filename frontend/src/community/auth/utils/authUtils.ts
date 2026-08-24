import { authenticationEndpoints as communityAuthEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { unitConversion } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  AdminTypes,
  AuthEmployeeType,
  EmployeeTypes,
  ManagerTypes,
  RepresentativeTypes,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import { isEnterpriseMode } from "~community/common/utils/commonUtil";
import {
  EnterpriseSignInParams,
  EnterpriseSignUpParams,
  enterpriseSignIn,
  enterpriseSignUp
} from "~enterprise/auth/utils/authUtils";
import { authenticationEndpoints } from "~enterprise/common/api/utils/ApiEndpoints";
import { TenantStatusEnums, TierEnum } from "~enterprise/common/enums/Common";

import { config } from "../../../../middleware";
import { drawerHiddenProtectedRoutes } from "../constants/routeConfigs";
import { SignInStatus } from "../enums/auth";
import {
  AuthResponseType,
  CommunitySignInParams,
  CommunitySignUpParams
} from "../types/auth";
import authAxios from "./authInterceptor";

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
    | RepresentativeTypes
  )[];
  accessToken?: string;
  refreshToken?: string;
  tokenDuration?: number;
  isPasswordChangedForTheFirstTime?: boolean;
  employee?: AuthEmployeeType;
  tier?: TierEnum;
  tiers?: TierEnum[];
  tenantId?: string;
  tenantStatus?: TenantStatusEnums;
}

// Flag to prevent recursive token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

let retrievePromise: Promise<string | null> | null = null;

const retrieveStoredAccessToken = async (): Promise<string | null> => {
  if (retrievePromise) {
    return retrievePromise;
  }

  retrievePromise = (async () => {
    try {
      const response = await fetch("/api/auth/access-token", {
        method: "GET",
        credentials: "same-origin"
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return typeof data?.accessToken === "string" && data.accessToken
        ? data.accessToken
        : null;
    } catch {
      console.error("Failed to retrieve the stored access token");
      return null;
    } finally {
      retrievePromise = null;
    }
  })();

  return retrievePromise;
};

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
        await setAccessToken(accessToken);
        return accessToken;
      }

      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const setAccessToken = async (token: string): Promise<void> => {
  useCommonStore.getState().setAccessToken(token);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/auth/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ accessToken: token })
      });
    } catch {
      console.error("Failed to persist access token cookie");
    }
  }
};

export const setIsPasswordChangedForTheFirstTime = async (
  value: boolean
): Promise<void> => {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/auth/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isPasswordChangedForTheFirstTime: value })
      });
    } catch {
      console.error("Failed to persist password-changed flag cookie");
    }
  }
};

export const clearCookies = async (): Promise<void> => {
  try {
    await authAxios.post(
      authenticationEndpoints.SIGNOUT,
      {},
      { withCredentials: true }
    );
  } catch {
    console.error("Error calling signout API");
  }

  useCommonStore.getState().clearAccessToken();

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/clear-cookies", {
        method: "POST",
        credentials: "same-origin"
      });
    } catch {
      console.error("Error clearing session cookies");
    }
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const cachedAccessToken = useCommonStore.getState().accessToken;

  if (cachedAccessToken && !isTokenExpired(cachedAccessToken)) {
    return cachedAccessToken;
  }

  if (!cachedAccessToken) {
    const storedToken = await retrieveStoredAccessToken();

    if (!storedToken) {
      return null;
    }

    if (!isTokenExpired(storedToken)) {
      useCommonStore.getState().setAccessToken(storedToken);
      return storedToken;
    }
  }

  const newToken = await getNewAccessToken();
  return newToken;
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
      email: claims?.sub,
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
      tiers: claims?.tiers as TierEnum[],
      tenantId: claims?.tenantId,
      tenantStatus: claims?.tenantStatus
    };
  } catch (error) {
    console.error("Failed to extract user from token:", error);
    return null;
  }
};

const handleAuthResponse = async (response: any): Promise<AuthResponseType> => {
  const accessToken = response?.data?.results[0]?.accessToken;
  const isPasswordChangedForTheFirstTime =
    response?.data?.results[0]?.isPasswordChangedForTheFirstTime;

  if (accessToken) {
    await setAccessToken(accessToken);

    await setIsPasswordChangedForTheFirstTime(
      isPasswordChangedForTheFirstTime ?? true
    );

    return { status: SignInStatus.SUCCESS };
  } else {
    return { status: SignInStatus.FAILURE, error: response?.data?.message };
  }
};

export const communitySignIn = async (
  params: CommunitySignInParams
): Promise<AuthResponseType> => {
  const payload = { email: params.email, password: params.password };
  try {
    const response = await authAxios.post(
      communityAuthEndpoints.CREDENTIAL_SIGN_IN,
      payload
    );
    return handleAuthResponse(response);
  } catch (error: any) {
    return {
      status: SignInStatus.FAILURE,
      error: error?.response?.data?.[0]?.messageKey
    };
  }
};

export const communitySignUp = async (
  params: CommunitySignUpParams
): Promise<AuthResponseType> => {
  const payload = {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    password: params.password
  };
  try {
    const response = await authAxios.post(
      communityAuthEndpoints.CREDENTIAL_SIGN_UP,
      payload
    );
    return handleAuthResponse(response);
  } catch (error: any) {
    return {
      status: SignInStatus.FAILURE,
      error: error?.response?.data?.[0]?.messageKey
    };
  }
};

export const handleSignIn = async (
  params: EnterpriseSignInParams
): Promise<AuthResponseType> => {
  if (!isEnterpriseMode()) {
    return communitySignIn(params);
  }
  return enterpriseSignIn(params);
};

export const handleSignUp = async (
  params: EnterpriseSignUpParams
): Promise<AuthResponseType> => {
  if (!isEnterpriseMode()) {
    return communitySignUp(params);
  }
  return enterpriseSignUp(params);
};

export const checkUserAuthentication = async (): Promise<User | null> => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const userData = extractUserFromToken(token);

  return userData;
};

export const signOut = async (redirect: boolean = true): Promise<void> => {
  await clearCookies();

  if (redirect === false) return;

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    if (currentPath === ROUTES.AUTH.SIGNIN) return;

    const urlParams = new URLSearchParams(window.location.search);
    const existingCallback = urlParams.get("callback");

    const callbackPath = existingCallback || currentPath;
    window.location.href = `${ROUTES.AUTH.SIGNIN}?callback=${encodeURIComponent(
      callbackPath
    )}`;
  }
};
