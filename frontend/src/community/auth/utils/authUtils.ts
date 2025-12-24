import ROUTES from "~community/common/constants/routes";
import {
  EnterpriseSignInParams,
  User,
  enterpriseSignIn,
  extractUserFromToken,
  getAccessToken
} from "~enterprise/auth/utils/authUtils";

import { AuthMethods, SignInStatus } from "../enums/auth";
import { config } from "../constants/routeConfigs";

export const drawerHiddenProtectedRoutes = [
  ROUTES.ORGANIZATION.SETUP,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY,
  ROUTES.AUTH.VERIFY_SUCCESS,
  ROUTES.AUTH.VERIFY_RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_GUEST,
  ROUTES.AUTH.VERIFY_GUEST_OTP,
  ROUTES.SETTINGS.PAYMENT,
  ROUTES.REMOVE_PEOPLE,
  ROUTES.CHANGE_SUPERVISORS,
  ROUTES.SUBSCRIPTION,
  ROUTES.SIGN.SIGN,
  ROUTES.SIGN.REVIEW,
  ROUTES.SIGN.INFO,
  ROUTES.SIGN.CREATE_DOCUMENT,
  ROUTES.SIGN.SENT_INFO.BASE,
  ROUTES.SIGN.INBOX_INFO.BASE,
  ROUTES.SIGN.DOCUMENT_ACCESS,
  ROUTES.INVOICE.CREATE.BASE,
  ROUTES.INVOICE.VIEW.BASE,
  ROUTES.INVOICE.CUSTOMERS.PROJECTS.BASE
];

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
    // Token expired or invalid
    localStorage.removeItem("accessToken");
    return null;
  }

  return userData;
};

export const handleRefreshToken = async (): Promise<SignInStatus> => {
  // TODO: Implement refresh token logic
  return SignInStatus.SUCCESS;
};
