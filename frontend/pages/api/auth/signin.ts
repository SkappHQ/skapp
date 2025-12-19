import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

import ROUTES from "~community/common/constants/routes";
import { decodeJWTToken } from "~community/common/utils/authUtils";
import authFetch from "~community/common/utils/axiosInterceptor";
import { encrypt } from "~community/common/utils/encryption";
import { authenticationEndpoints } from "~enterprise/common/api/utils/ApiEndpoints";
import { AuthRedirectionEnums } from "~enterprise/common/enums/Common";
import epAuthFetch from "~enterprise/common/utils/axiosInterceptor";
import { guestUserEndpoints } from "~enterprise/projects/api/utils/ApiEndpoints";

const SESSION_COOKIE_NAME = "skapp-session";
const REFRESH_TOKEN_COOKIE_NAME = "skapp-refresh-token";
const TENANT_ID_COOKIE_NAME = "skapp-tenant-id";
const SESSION_MAX_AGE = 86400; // 24 hours
const REFRESH_TOKEN_MAX_AGE = 604800; // 7 days

interface SignInRequestBody {
  provider: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  method?: string;
  code?: string;
  organizationId?: string;
  email_otp?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, firstName, lastName, tenantId, method, code } =
      req.body as SignInRequestBody;

    const isEnterprise = process.env.NEXT_PUBLIC_MODE === "enterprise";
    let url: string | null = null;
    let body: any = null;
    let isTemporaryUser = false;
    let axiosInstance = isEnterprise ? epAuthFetch : authFetch;

    // Determine the authentication method and endpoint
    if (isEnterprise) {
      // Enterprise authentication flows
      if (method === AuthRedirectionEnums.GOOGLE_SIGNUP) {
        isTemporaryUser = true;
        url = authenticationEndpoints.GOOGLE_SIGN_UP;
        body = { code };
      } else if (method === AuthRedirectionEnums.GOOGLE_SIGNIN) {
        url = authenticationEndpoints.GOOGLE_SIGN_IN;
        body = { code };
      } else if (method === AuthRedirectionEnums.MICROSOFT_SIGNUP) {
        isTemporaryUser = true;
        url = authenticationEndpoints.MICROSOFT_SIGN_UP;
        body = { code };
      } else if (method === AuthRedirectionEnums.MICROSOFT_SIGNIN) {
        url = authenticationEndpoints.MICROSOFT_SIGN_IN;
        body = { code };
      } else if (method === AuthRedirectionEnums.SIGNIN_AFTER_ORG_SETUP) {
        url = authenticationEndpoints.FIRSTTIME_SIGN_IN;
        body = { code };
      } else if (method === AuthRedirectionEnums.GUEST_SIGNIN) {
        url = guestUserEndpoints.VERIFY_GUEST_OTP;
        body = { email, otp: code };
      } else if (firstName && lastName) {
        isTemporaryUser = true;
        url = authenticationEndpoints.CREDENTIAL_SIGN_UP;
        body = {
          firstName,
          lastName,
          email,
          password,
          confirmPassword: password
        };
      } else if (password && email) {
        url = authenticationEndpoints.CREDENTIAL_SIGN_IN;
        body = { email, password };
      }
    } else {
      // Community authentication flows
      if (firstName && lastName) {
        url = "/auth/signup/super-admin";
        body = {
          firstName,
          lastName,
          email,
          password,
          confirmPassword: password
        };
      } else {
        url = "/auth/sign-in";
        body = { email, password };
      }
    }

    if (!url || !body) {
      return res
        .status(400)
        .json({ error: "Invalid authentication parameters" });
    }

    // Make the authentication request
    const headers: any = {};
    if (tenantId) {
      headers["X-Tenant-ID"] = tenantId;
    }

    const response = await axiosInstance.post(url, body, { headers });
    const user = response?.data?.results[0];

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Decode JWT token to extract user data
    const decodedToken = decodeJWTToken(user.accessToken);

    // Build session object (without refresh token for client)
    const sessionUser = {
      id: user.id || decodedToken?.userId?.toString() || "",
      name: user.name || `${firstName} ${lastName}` || "",
      email: email || user.email || decodedToken?.email,
      roles: decodedToken?.roles || [],
      tokenDuration: decodedToken?.exp,
      isPasswordChangedForTheFirstTime: user.isPasswordChangedForTheFirstTime,
      employee: user.employee,
      ...(isEnterprise && {
        tenantId: tenantId || user.tenantId,
        tier: decodedToken?.tier,
        tenantStatus: decodedToken?.tenantStatus,
        userId: decodedToken?.userId,
        ...(isTemporaryUser && { isTemporaryUser: true })
      }),
      ...(method === AuthRedirectionEnums.GUEST_SIGNIN && {
        userId: decodedToken?.userId
      })
    };

    const session = {
      user: sessionUser,
      expires: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()
    };

    // Encrypt refresh token before storing in cookie
    const encryptedRefreshToken = encrypt(user.refreshToken || "");

    // Encrypt sensitive session data for cookie storage
    const encryptedSessionData = encrypt(
      JSON.stringify({
        ...session,
        refreshToken: user.refreshToken,
        tenantId: tenantId || user.tenantId
      })
    );

    // Set HTTP-only cookies for session management
    const sessionCookie = serialize(SESSION_COOKIE_NAME, encryptedSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/"
    });

    const refreshTokenCookie = serialize(
      REFRESH_TOKEN_COOKIE_NAME,
      encryptedRefreshToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: "/"
      }
    );

    const cookies = [sessionCookie, refreshTokenCookie];

    if (tenantId) {
      const tenantCookie = serialize(TENANT_ID_COOKIE_NAME, tenantId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
      });
      cookies.push(tenantCookie);
    }

    res.setHeader("Set-Cookie", cookies);

    // Determine redirect URL
    let redirectUrl = ROUTES.DASHBOARD.BASE;

    if (user.isPasswordChangedForTheFirstTime === false) {
      redirectUrl = ROUTES.AUTH.RESET_PASSWORD;
    } else if (!isEnterprise && user.organizationSetupComplete === false) {
      redirectUrl = ROUTES.ORGANIZATION.SETUP;
    }

    // Return only access token and user data (no refresh token)
    return res.status(200).json({
      accessToken: user.accessToken,
      user: sessionUser,
      url: redirectUrl
    });
  } catch (error: any) {
    console.error("Sign in error:", error);

    const errorMessage =
      error?.response?.data?.results?.[0]?.messageKey ||
      error?.message ||
      "Authentication failed";

    return res.status(error?.response?.status || 500).json({
      error: errorMessage
    });
  }
}
