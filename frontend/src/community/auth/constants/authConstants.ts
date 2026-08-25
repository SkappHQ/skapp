import { unitConversion } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";

export const COOKIE_EXPIRY_DAYS = 31;

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";

export const IS_PASSWORD_CHANGED_COOKIE_NAME =
  "isPasswordChangedForTheFirstTime";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const REFRESH_TOKEN_COOKIE_SUFFIX = "_refreshToken";

export const PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS =
  COOKIE_EXPIRY_DAYS *
  unitConversion.HOURS_PER_DAY *
  unitConversion.MINUTES_PER_HOUR *
  unitConversion.SECONDS_PER_MINUTE;

export const JWT_PATTERN = /^[\w-]+\.[\w-]+\.[\w-]+$/;

export const MAX_ACCESS_TOKEN_LENGTH = 4096;

export const EDGE_REFRESH_TIMEOUT_MS = 3000;

export const SESSION_COOKIE_ATTRIBUTES = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax"
} as const;

export const buildSessionCookieHeader = (
  name: string,
  value: string,
  maxAgeSeconds: number
): string =>
  `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; Secure; HttpOnly; SameSite=Lax`;

export const PUBLIC_ROUTES: string[] = [
  ROUTES.AUTH.SIGNIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.ENTERPRISE_SIGNIN,
  ROUTES.AUTH.OAUTH_SIGNIN,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.FORGET_PASSWORD,
  ROUTES.AUTH.VERIFY,
  ROUTES.AUTH.VERIFY_SUCCESS,
  ROUTES.AUTH.VERIFY_RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_GUEST,
  ROUTES.AUTH.VERIFY_GUEST_OTP,
  ROUTES.SIGN.DOCUMENT_ACCESS,
  ROUTES.MAINTENANCE
];
