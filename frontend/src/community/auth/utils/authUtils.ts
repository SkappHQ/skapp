import {
  authenticationEndpoints as communityAuthEndpoints,
  internalApiEndpoints
} from "~community/common/api/utils/ApiEndpoints";
import ROUTES from "~community/common/constants/routes";
import { HttpMethods } from "~community/common/constants/stringConstants";
import { AuthTokenSliceType } from "~community/common/stores/slices/authTokenSlice";
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
import { extractClaimsFromToken, isTokenExpired } from "./tokenUtils";

export {
  decodeJWTToken,
  extractClaimsFromToken,
  isTokenExpired
} from "./tokenUtils";

export const resolvePostSignInPath = (
  callback: string | string[] | undefined,
  currentPath: string
): string => {
  const path = Array.isArray(callback) ? callback[0] : callback;

  if (!path || typeof window === "undefined") {
    return ROUTES.DASHBOARD.BASE;
  }

  try {
    const target = new URL(path, window.location.origin);

    if (
      target.origin !== window.location.origin ||
      target.pathname === currentPath
    ) {
      return ROUTES.DASHBOARD.BASE;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return ROUTES.DASHBOARD.BASE;
  }
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

export interface SessionPayload {
  accessToken: string;
  isPasswordChangedForTheFirstTime: boolean;
}

// Flag to prevent recursive token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

let retrievePromise: Promise<string | null> | null = null;
let hasCheckedStoredToken = false;

// Flag to prevent recursive sign out
let isSigningOut = false;

const resetStoredTokenCheck = (): void => {
  hasCheckedStoredToken = false;
};

const retrieveStoredAccessToken = async (): Promise<string | null> => {
  if (retrievePromise) {
    return retrievePromise;
  }

  if (hasCheckedStoredToken) {
    return null;
  }

  retrievePromise = (async () => {
    try {
      const response = await fetch(internalApiEndpoints.ACCESS_TOKEN, {
        method: HttpMethods.GET,
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
      return null;
    } finally {
      hasCheckedStoredToken = true;
      retrievePromise = null;
    }
  })();

  return retrievePromise;
};

export const getNewAccessToken = async (
  authTokenStore: AuthTokenSliceType
): Promise<string | null> => {
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
        await setAccessToken(accessToken, authTokenStore);
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

export const setAccessToken = async (
  token: string,
  authTokenStore: AuthTokenSliceType
): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  authTokenStore.setAccessToken(token);
  resetStoredTokenCheck();

  try {
    const response = await fetch(internalApiEndpoints.ACCESS_TOKEN, {
      method: HttpMethods.POST,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ accessToken: token })
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const persistSession = async (
  { accessToken, isPasswordChangedForTheFirstTime }: SessionPayload,
  authTokenStore: AuthTokenSliceType
): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  authTokenStore.setAccessToken(accessToken);
  resetStoredTokenCheck();

  try {
    const response = await fetch(internalApiEndpoints.ACCESS_TOKEN, {
      method: HttpMethods.POST,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ accessToken, isPasswordChangedForTheFirstTime })
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const clearCookies = async (
  authTokenStore: AuthTokenSliceType
): Promise<void> => {
  try {
    await authAxios.post(
      authenticationEndpoints.SIGNOUT,
      {},
      { withCredentials: true }
    );
  } catch {
    console.error("Error calling signout API");
  }

  authTokenStore.clearAccessToken();
  resetStoredTokenCheck();

  if (typeof window !== "undefined") {
    try {
      await fetch(internalApiEndpoints.CLEAR_COOKIES, {
        method: HttpMethods.POST,
        credentials: "same-origin"
      });
    } catch {
      console.error("Error clearing cookies");
    }
  }
};

export const getAccessToken = async (
  authTokenStore: AuthTokenSliceType
): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  const cachedAccessToken = authTokenStore.accessToken;

  if (cachedAccessToken && !isTokenExpired(cachedAccessToken)) {
    return cachedAccessToken;
  }

  const storedToken = await retrieveStoredAccessToken();

  if (storedToken && !isTokenExpired(storedToken)) {
    authTokenStore.setAccessToken(storedToken);
    return storedToken;
  }

  // No evidence of an existing session, so do not escalate to a refresh call
  if (!cachedAccessToken && !storedToken) {
    return null;
  }

  const newToken = await getNewAccessToken(authTokenStore);
  return newToken;
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

const handleAuthResponse = async (
  response: any,
  authTokenStore: AuthTokenSliceType
): Promise<AuthResponseType> => {
  const accessToken = response?.data?.results[0]?.accessToken;
  const isPasswordChangedForTheFirstTime =
    response?.data?.results[0]?.isPasswordChangedForTheFirstTime;

  if (accessToken) {
    const isSessionPersisted = await persistSession(
      {
        accessToken,
        isPasswordChangedForTheFirstTime:
          typeof isPasswordChangedForTheFirstTime === "boolean"
            ? isPasswordChangedForTheFirstTime
            : true
      },
      authTokenStore
    );

    if (!isSessionPersisted) {
      return {
        status: SignInStatus.FAILURE,
        error: "Failed to persist the session"
      };
    }

    return { status: SignInStatus.SUCCESS };
  } else {
    return { status: SignInStatus.FAILURE, error: response?.data?.message };
  }
};

export const communitySignIn = async (
  params: CommunitySignInParams,
  authTokenStore: AuthTokenSliceType
): Promise<AuthResponseType> => {
  const payload = { email: params.email, password: params.password };
  try {
    const response = await authAxios.post(
      communityAuthEndpoints.CREDENTIAL_SIGN_IN,
      payload
    );
    return handleAuthResponse(response, authTokenStore);
  } catch (error: any) {
    return {
      status: SignInStatus.FAILURE,
      error: error?.response?.data?.[0]?.messageKey
    };
  }
};

export const communitySignUp = async (
  params: CommunitySignUpParams,
  authTokenStore: AuthTokenSliceType
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
    return handleAuthResponse(response, authTokenStore);
  } catch (error: any) {
    return {
      status: SignInStatus.FAILURE,
      error: error?.response?.data?.[0]?.messageKey
    };
  }
};

export const handleSignIn = async (
  params: EnterpriseSignInParams,
  authTokenStore: AuthTokenSliceType
): Promise<AuthResponseType> => {
  if (!isEnterpriseMode()) {
    return communitySignIn(params, authTokenStore);
  }
  return enterpriseSignIn(params, authTokenStore);
};

export const handleSignUp = async (
  params: EnterpriseSignUpParams,
  authTokenStore: AuthTokenSliceType
): Promise<AuthResponseType> => {
  if (!isEnterpriseMode()) {
    return communitySignUp(params, authTokenStore);
  }
  return enterpriseSignUp(params, authTokenStore);
};

export const checkUserAuthentication = async (
  authTokenStore: AuthTokenSliceType
): Promise<User | null> => {
  const token = await getAccessToken(authTokenStore);

  if (!token) {
    return null;
  }

  const userData = extractUserFromToken(token);

  return userData;
};

export const signOut = async (
  authTokenStore: AuthTokenSliceType,
  redirect: boolean = true
): Promise<void> => {
  if (isSigningOut) return;

  isSigningOut = true;

  const hadActiveSession = Boolean(authTokenStore.accessToken);

  try {
    await clearCookies(authTokenStore);

    if (redirect === false || !hadActiveSession) return;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const existingCallback = urlParams.get("callback");

      const callbackPath = existingCallback || window.location.pathname;
      window.location.href = `${ROUTES.AUTH.SIGNIN}?callback=${encodeURIComponent(
        callbackPath
      )}`;
    }
  } finally {
    isSigningOut = false;
  }
};
