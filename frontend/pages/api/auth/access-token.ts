import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE_EXPIRY_DAYS = 31;
const MAX_AGE_SECONDS = 60 * 60 * 24 * COOKIE_EXPIRY_DAYS;

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

  const setCookieHeaders: string[] = [];

  if (typeof accessToken === "string" && accessToken.length > 0) {
    setCookieHeaders.push(
      `accessToken=${accessToken}; Path=/; Max-Age=${MAX_AGE_SECONDS}; Secure; HttpOnly; SameSite=Lax`
    );
  }

  if (isPasswordChangedForTheFirstTime !== undefined) {
    setCookieHeaders.push(
      `isPasswordChangedForTheFirstTime=${String(
        isPasswordChangedForTheFirstTime
      )}; Path=/; Max-Age=${MAX_AGE_SECONDS}; Secure; HttpOnly; SameSite=Lax`
    );
  }

  if (setCookieHeaders.length === 0) {
    return res.status(400).json({ message: "Nothing to set" });
  }

  res.setHeader("Set-Cookie", setCookieHeaders);
  return res.status(200).json({ message: "Session cookie updated" });
}
