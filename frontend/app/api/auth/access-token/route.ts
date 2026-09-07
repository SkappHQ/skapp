import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  IS_PASSWORD_CHANGED_COOKIE_NAME,
  PASSWORD_CHANGED_COOKIE_MAX_AGE_SECONDS,
  buildSessionCookieHeader
} from "~community/auth/constants/authConstants";
import {
  AccessTokenMessageKey,
  SessionRefreshStatus
} from "~community/auth/enums/auth";
import {
  buildRefreshCookieHeader,
  requestSessionRefresh,
  resolveTenantId
} from "~community/auth/utils/edgeSessionUtils";
import {
  getTokenMaxAgeSeconds,
  isTokenExpired
} from "~community/auth/utils/tokenUtils";
import {
  TENANT_COOKIE_NAME,
  TENANT_QUERY_PARAM
} from "~enterprise/common/constants/stringConstants";

const refreshAccessToken = async (
  req: NextRequest
): Promise<string | null> => {
  const cookies = req.cookies.getAll().map(({ name, value }) => ({
    name,
    value: value ?? ""
  }));

  const tenantId = resolveTenantId(
    req.headers.get("host") ?? undefined,
    req.nextUrl.searchParams.get(TENANT_QUERY_PARAM) ?? undefined,
    req.cookies.get(TENANT_COOKIE_NAME)?.value
  );

  const result = await requestSessionRefresh(
    buildRefreshCookieHeader(cookies),
    tenantId
  );

  return result.status === SessionRefreshStatus.SUCCESSFUL
    ? result.session.accessToken
    : null;
};

export async function GET(req: NextRequest) {
  const storedToken = req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (storedToken && !isTokenExpired(storedToken)) {
    return NextResponse.json(
      {
        messageKey: AccessTokenMessageKey.SESSION_COOKIE_READ,
        accessToken: storedToken
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const refreshedToken = await refreshAccessToken(req);

  if (!refreshedToken) {
    return NextResponse.json(
      {
        messageKey: AccessTokenMessageKey.NO_ACTIVE_SESSION,
        accessToken: null
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = NextResponse.json(
    {
      messageKey: AccessTokenMessageKey.SESSION_REFRESHED,
      accessToken: refreshedToken
    },
    { headers: { "Cache-Control": "no-store" } }
  );

  response.headers.append(
    "Set-Cookie",
    buildSessionCookieHeader(
      ACCESS_TOKEN_COOKIE_NAME,
      refreshedToken,
      getTokenMaxAgeSeconds(refreshedToken)
    )
  );

  return response;
}

export async function POST(req: NextRequest) {
  const { accessToken, isPasswordChangedForTheFirstTime } =
    (await req.json().catch(() => ({}))) ?? {};

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
    return NextResponse.json(
      { messageKey: AccessTokenMessageKey.NOTHING_TO_SET },
      { status: 400 }
    );
  }

  const response = NextResponse.json({
    messageKey: AccessTokenMessageKey.SESSION_COOKIE_UPDATED
  });

  cookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));

  return response;
}
