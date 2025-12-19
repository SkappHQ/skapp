import { NextApiRequest, NextApiResponse } from "next";
import { parse, serialize } from "cookie";
import { decodeJWTToken } from "~community/common/utils/authUtils";
import authFetch from "~community/common/utils/axiosInterceptor";
import epAuthFetch from "~enterprise/common/utils/axiosInterceptor";
import { authenticationEndpoints } from "~enterprise/common/api/utils/ApiEndpoints";
import { encrypt, decrypt } from "~community/common/utils/encryption";

const SESSION_COOKIE_NAME = "skapp-session";
const REFRESH_TOKEN_COOKIE_NAME = "skapp-refresh-token";
const TENANT_ID_COOKIE_NAME = "skapp-tenant-id";
const SESSION_MAX_AGE = 86400; // 24 hours
const REFRESH_TOKEN_MAX_AGE = 604800; // 7 days

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookie = parse(req.headers.cookie || "");
    const encryptedSession = cookie[SESSION_COOKIE_NAME];
    const encryptedRefreshToken = cookie[REFRESH_TOKEN_COOKIE_NAME];
    const tenantId = cookie[TENANT_ID_COOKIE_NAME];

    if (!encryptedSession || !encryptedRefreshToken) {
      return res.status(401).json({ error: "No session found" });
    }

    // Decrypt session and refresh token
    const sessionData = JSON.parse(decrypt(encryptedSession));
    const refreshToken = decrypt(encryptedRefreshToken);

    const isEnterprise = process.env.NEXT_PUBLIC_MODE === "enterprise";
    const axiosInstance = isEnterprise ? epAuthFetch : authFetch;

    // Refresh the token
    const headers: any = {};
    if (tenantId) {
      headers["X-Tenant-ID"] = tenantId;
    }

    const url = isEnterprise 
      ? authenticationEndpoints.REFRESH_TOKEN 
      : "/auth/refresh-token";

    const response = await axiosInstance.post(
      url,
      { refreshToken },
      { headers }
    );

    const newAccessToken = response?.data?.results[0]?.accessToken;
    const newRefreshToken = response?.data?.results[0]?.refreshToken;

    if (!newAccessToken) {
      return res.status(401).json({ error: "Failed to refresh token" });
    }

    // Decode new token
    const decodedToken = decodeJWTToken(newAccessToken);

    // Update session with new token (without exposing tokens to client)
    const updatedSessionUser = {
      ...sessionData.user,
      tokenDuration: decodedToken?.exp,
      ...(isEnterprise && {
        tier: decodedToken?.tier,
        tenantStatus: decodedToken?.tenantStatus,
        roles: decodedToken?.roles,
        userId: decodedToken?.userId,
      }),
    };

    const updatedSession = {
      user: updatedSessionUser,
      refreshToken: newRefreshToken || refreshToken,
      expires: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
    };

    // Encrypt and update cookies
    const encryptedUpdatedSession = encrypt(JSON.stringify(updatedSession));
    const encryptedNewRefreshToken = encrypt(newRefreshToken || refreshToken);
    
    const cookies = [
      serialize(SESSION_COOKIE_NAME, encryptedUpdatedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      }),
      serialize(REFRESH_TOKEN_COOKIE_NAME, encryptedNewRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: "/",
      })
    ];

    res.setHeader("Set-Cookie", cookies);

    // Return only access token (no refresh token to client)
    return res.status(200).json({
      accessToken: newAccessToken,
      user: updatedSessionUser,
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return res.status(401).json({
      error: error?.message || "Failed to refresh session",
    });
  }
}
