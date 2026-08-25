import type { NextApiRequest, NextApiResponse } from "next";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  IS_PASSWORD_CHANGED_COOKIE_NAME,
  JWT_PATTERN,
  MAX_ACCESS_TOKEN_LENGTH,
  PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS,
  buildSessionCookieHeader
} from "~community/auth/constants/authConstants";
import { getTokenMaxAgeSeconds } from "~community/auth/utils/tokenUtils";

interface ResponseData {
  message: string;
  accessToken?: string | null;
}

interface AccessTokenRequestBody {
  accessToken?: unknown;
  isPasswordChangedForTheFirstTime?: unknown;
}

const isSameOriginRequest = (req: NextApiRequest): boolean => {
  const fetchSite = req.headers["sec-fetch-site"];

  if (typeof fetchSite === "string" && fetchSite !== "same-origin") {
    return false;
  }

  const origin = req.headers.origin;

  if (!origin) return true;

  const host = req.headers.host;

  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const isJsonRequest = (req: NextApiRequest): boolean =>
  (req.headers["content-type"] ?? "")
    .toString()
    .toLowerCase()
    .startsWith("application/json");

const isValidAccessToken = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= MAX_ACCESS_TOKEN_LENGTH &&
  JWT_PATTERN.test(value);

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    if (req.method === "GET") {
      const storedToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME] ?? null;

      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Vary", "Cookie");

      return res.status(200).json({
        message: storedToken ? "Session cookie found" : "No session cookie",
        accessToken: storedToken
      });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!isJsonRequest(req) || !isSameOriginRequest(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { accessToken, isPasswordChangedForTheFirstTime } = (req.body ??
      {}) as AccessTokenRequestBody;

    if (
      accessToken === undefined &&
      isPasswordChangedForTheFirstTime === undefined
    ) {
      return res.status(400).json({ message: "Nothing to set" });
    }

    if (accessToken !== undefined && !isValidAccessToken(accessToken)) {
      return res.status(400).json({ message: "Invalid access token" });
    }

    if (
      isPasswordChangedForTheFirstTime !== undefined &&
      typeof isPasswordChangedForTheFirstTime !== "boolean"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid isPasswordChangedForTheFirstTime value" });
    }

    const setCookieHeaders: string[] = [];

    if (isValidAccessToken(accessToken)) {
      const maxAge = getTokenMaxAgeSeconds(accessToken);

      if (maxAge <= 0) {
        return res.status(400).json({ message: "Access token has expired" });
      }

      setCookieHeaders.push(
        buildSessionCookieHeader(ACCESS_TOKEN_COOKIE_NAME, accessToken, maxAge)
      );
    }

    if (typeof isPasswordChangedForTheFirstTime === "boolean") {
      setCookieHeaders.push(
        buildSessionCookieHeader(
          IS_PASSWORD_CHANGED_COOKIE_NAME,
          String(isPasswordChangedForTheFirstTime),
          PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS
        )
      );
    }

    res.setHeader("Set-Cookie", setCookieHeaders);
    return res.status(200).json({ message: "Session cookie updated" });
  } catch (error) {
    console.error("Failed to update the session cookies:", error);
    return res.status(500).json({ message: "Failed to update session cookie" });
  }
}
