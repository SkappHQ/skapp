import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

const SESSION_COOKIE_NAME = "skapp-session";
const REFRESH_TOKEN_COOKIE_NAME = "skapp-refresh-token";
const TENANT_ID_COOKIE_NAME = "skapp-tenant-id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Clear all auth cookies
    const clearCookies = [
      serialize(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
      }),
      serialize(REFRESH_TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
      }),
      serialize(TENANT_ID_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
      })
    ];

    res.setHeader("Set-Cookie", clearCookies);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({ error: "Failed to sign out" });
  }
}
