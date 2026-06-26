import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
  clearedCookies?: string[];
};

/**
 * API endpoint to clear all cookies for the current domain
 * This will clear both HTTP and secure cookies
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Only allow POST method for security
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const cookies = req.cookies;
    const clearedCookies: string[] = [];

    // Get all cookie names from the request
    const cookieNames = Object.keys(cookies);

    if (cookieNames.length === 0) {
      return res.status(200).json({
        message: "No cookies found to clear",
        clearedCookies: []
      });
    }

    // Set each cookie to expire immediately
    const setCookieHeaders: string[] = [];

    cookieNames.forEach((cookieName) => {
      clearedCookies.push(cookieName);

      // Clear cookie for current path
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`
      );

      // Clear secure cookie for current path
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure`
      );

      // Clear httpOnly cookie for current path
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly`
      );

      // Clear secure + httpOnly cookie for current path
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure; HttpOnly`
      );

      // Clear with SameSite=Strict
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Strict`
      );

      // Clear with SameSite=Lax
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`
      );

      // Clear with SameSite=None
      setCookieHeaders.push(
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure; SameSite=None`
      );
    });

    // Set all the Set-Cookie headers at once
    res.setHeader("Set-Cookie", setCookieHeaders);

    return res.status(200).json({
      message: `Successfully cleared ${clearedCookies.length} cookie(s)`,
      clearedCookies
    });
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return res.status(500).json({
      message: "Failed to clear cookies"
    });
  }
}
