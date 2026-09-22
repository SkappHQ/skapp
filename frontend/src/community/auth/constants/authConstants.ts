import { unitConversion } from "~community/common/constants/configs";

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
