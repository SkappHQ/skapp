import { NextRequest, NextResponse } from "next/server";

const EXPIRY = "Thu, 01 Jan 1970 00:00:00 GMT";

/**
 * API endpoint to clear all cookies for the current domain
 * This will clear both HTTP and secure cookies
 */
export async function POST(req: NextRequest) {
  try {
    const cookieNames = req.cookies.getAll().map((cookie) => cookie.name);

    if (cookieNames.length === 0) {
      return NextResponse.json({
        message: "No cookies found to clear",
        clearedCookies: []
      });
    }

    const response = NextResponse.json({
      message: `Successfully cleared ${cookieNames.length} cookie(s)`,
      clearedCookies: cookieNames
    });

    cookieNames.forEach((cookieName) => {
      const base = `${cookieName}=; Path=/; Expires=${EXPIRY}; Max-Age=0`;

      // Clear cookie for current path
      response.headers.append("Set-Cookie", base);
      // Clear secure cookie for current path
      response.headers.append("Set-Cookie", `${base}; Secure`);
      // Clear httpOnly cookie for current path
      response.headers.append("Set-Cookie", `${base}; HttpOnly`);
      // Clear secure + httpOnly cookie for current path
      response.headers.append("Set-Cookie", `${base}; Secure; HttpOnly`);
      // Clear with SameSite=Strict
      response.headers.append("Set-Cookie", `${base}; SameSite=Strict`);
      // Clear with SameSite=Lax
      response.headers.append("Set-Cookie", `${base}; SameSite=Lax`);
      // Clear with SameSite=None
      response.headers.append("Set-Cookie", `${base}; Secure; SameSite=None`);
    });

    return response;
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return NextResponse.json(
      { message: "Failed to clear cookies" },
      { status: 500 }
    );
  }
}
