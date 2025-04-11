import ROUTES from "~community/common/constants/routes";
import { config } from "~middleware";

export const drawerHiddenProtectedRoutes = [
  ROUTES.ORGANIZATION.SETUP,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY,
  ROUTES.AUTH.VERIFY_SUCCESS,
  ROUTES.AUTH.VERIFY_ACCOUNT_RESET_PASSWORD,
  ROUTES.SETTINGS.PAYMENT,
  ROUTES.REMOVE_PEOPLE,
  ROUTES.CHANGE_SUPERVISORS,
  ROUTES.SUBSCRIPTION
];

export const IsAProtectedUrlWithDrawer = (asPath: string): boolean => {
  const formattedProtectedPaths = config.matcher.map((path) =>
    path.replace(/\/:path\*$/, "")
  );

  const protectedPaths = formattedProtectedPaths.filter((path) => {
    return !drawerHiddenProtectedRoutes.includes(path);
  });

  return protectedPaths.some(
    (path) =>
      // NOTE: Even though /signup paths is an unprotected route, but since we are sending a temporary
      // jwt token for the rest of the /signup flow, we have to consider it has a protected route here
      // or the signup flow will break
      !asPath.includes(ROUTES.AUTH.SIGNUP) &&
      !asPath.includes(ROUTES.SIGN.SIGN) &&
      !asPath.includes(ROUTES.SIGN.CREATE_DOCUMENT) &&
      asPath.includes(path)
  );
};

export const decodeJWTToken = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const decodedToken = JSON.parse(atob(base64));
  return decodedToken;
};
