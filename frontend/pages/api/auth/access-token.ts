import type { NextApiRequest, NextApiResponse } from "next";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  IS_PASSWORD_CHANGED_COOKIE_NAME,
  PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS,
  buildSessionCookieHeader
} from "~community/auth/constants/authConstants";
import { getTokenMaxAgeSeconds } from "~community/auth/utils/tokenUtils";

interface ResponseData {
  message: string;
  accessToken?: string | null;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      message: "Session cookie read",
      accessToken: req.cookies[ACCESS_TOKEN_COOKIE_NAME] ?? null
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { accessToken, isPasswordChangedForTheFirstTime } = req.body ?? {};

  const cookies: string[] = [];

  if (typeof accessToken === "string" && accessToken) {
    cookies.push(
      buildSessionCookieHeader(
        ACCESS_TOKEN_COOKIE_NAME,
        accessToken,
        getTokenMaxAgeSeconds(accessToken)
      )
    );
  }

  if (typeof isPasswordChangedForTheFirstTime === "boolean") {
    cookies.push(
      buildSessionCookieHeader(
        IS_PASSWORD_CHANGED_COOKIE_NAME,
        String(isPasswordChangedForTheFirstTime),
        PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS
      )
    );
  }

  if (cookies.length === 0) {
    return res.status(400).json({ message: "Nothing to set" });
  }

  res.setHeader("Set-Cookie", cookies);
  return res.status(200).json({ message: "Session cookie updated" });
}
