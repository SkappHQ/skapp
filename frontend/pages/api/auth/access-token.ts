import type { NextApiRequest, NextApiResponse } from "next";

import { getTokenMaxAgeSeconds } from "~community/auth/utils/tokenUtils";

type ResponseData = {
  message: string;
  accessToken?: string | null;
  isPasswordChangedForTheFirstTime?: boolean | null;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    const storedToken = req.cookies.accessToken ?? null;
    const storedPasswordFlag = req.cookies.isPasswordChangedForTheFirstTime;

    return res.status(200).json({
      message: storedToken ? "Session cookie found" : "No session cookie",
      accessToken: storedToken,
      isPasswordChangedForTheFirstTime:
        storedPasswordFlag === undefined ? null : storedPasswordFlag === "true"
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { accessToken, isPasswordChangedForTheFirstTime } = req.body || {};

  if (
    accessToken === undefined &&
    isPasswordChangedForTheFirstTime === undefined
  ) {
    return res.status(400).json({ message: "Nothing to set" });
  }

  const referenceToken =
    (typeof accessToken === "string" && accessToken) ||
    req.cookies.accessToken ||
    "";
  const maxAge = getTokenMaxAgeSeconds(referenceToken);

  if (maxAge <= 0) {
    return res.status(400).json({ message: "Access token has expired" });
  }

  const setCookieHeaders: string[] = [];

  if (typeof accessToken === "string" && accessToken.length > 0) {
    setCookieHeaders.push(
      `accessToken=${accessToken}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`
    );
  }

  if (isPasswordChangedForTheFirstTime !== undefined) {
    setCookieHeaders.push(
      `isPasswordChangedForTheFirstTime=${String(
        isPasswordChangedForTheFirstTime
      )}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`
    );
  }

  if (setCookieHeaders.length === 0) {
    return res.status(400).json({ message: "Nothing to set" });
  }

  res.setHeader("Set-Cookie", setCookieHeaders);
  return res.status(200).json({ message: "Session cookie updated" });
}
