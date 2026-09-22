import type { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  EDGE_REFRESH_TIMEOUT_MS,
  IS_PASSWORD_CHANGED_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_SUFFIX,
  SESSION_COOKIE_ATTRIBUTES
} from "~community/auth/constants/authConstants";
import { SessionRefreshStatus } from "~community/auth/enums/auth";
import { authenticationEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { appModes } from "~community/common/constants/configs";
import {
  HttpMethods,
  LOCALHOST
} from "~community/common/constants/stringConstants";
import { getApiUrl } from "~community/common/utils/getConstants";
import {
  TENANT_COOKIE_NAME,
  TENANT_HEADER_NAME,
  TENANT_QUERY_PARAM,
  TENANT_SELECTION_SUBDOMAINS
} from "~enterprise/common/constants/stringConstants";

import { getTokenMaxAgeSeconds } from "./tokenUtils";

const hasTenantSubdomain = (hostname: string, subdomain: string): boolean =>
  hostname.split(".").length > 2 &&
  subdomain !== LOCALHOST &&
  !TENANT_SELECTION_SUBDOMAINS.includes(subdomain);

export interface RefreshedSession {
  accessToken: string;
}

export type RefreshSessionResult =
  | { status: SessionRefreshStatus.SUCCESSFUL; session: RefreshedSession }
  | { status: SessionRefreshStatus.UNAUTHORIZED }
  | { status: SessionRefreshStatus.ERROR };

export interface SessionCookie {
  name: string;
  value: string;
}

export const resolveTenantId = (
  host: string | undefined,
  fromQuery: string | undefined,
  fromCookie: string | undefined
): string => {
  const hostname = (host || "").toLowerCase().split(":")[0];
  const subdomain = hostname.split(".")[0];

  if (subdomain && hasTenantSubdomain(hostname, subdomain)) {
    return subdomain;
  }

  return (fromQuery || fromCookie || "").trim().toLowerCase();
};

const isRefreshTokenCookie = (name: string): boolean =>
  name === REFRESH_TOKEN_COOKIE_NAME ||
  name.endsWith(REFRESH_TOKEN_COOKIE_SUFFIX);

export const buildRefreshCookieHeader = (cookies: SessionCookie[]): string =>
  cookies
    .filter((cookie) => isRefreshTokenCookie(cookie.name))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

export const requestSessionRefresh = async (
  cookieHeader: string,
  tenantId: string
): Promise<RefreshSessionResult> => {
  const apiUrl = getApiUrl();

  if (!apiUrl) return { status: SessionRefreshStatus.ERROR };

  if (!cookieHeader) return { status: SessionRefreshStatus.UNAUTHORIZED };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    cookie: cookieHeader
  };

  if (process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE && tenantId) {
    headers[TENANT_HEADER_NAME] = tenantId;
  }

  try {
    const response = await fetch(
      `${apiUrl}${authenticationEndpoints.REFRESH_TOKEN}`,
      {
        method: HttpMethods.POST,
        headers,
        body: "{}",
        signal: AbortSignal.timeout(EDGE_REFRESH_TIMEOUT_MS)
      }
    );

    if (response.status === 401 || response.status === 403) {
      return { status: SessionRefreshStatus.UNAUTHORIZED };
    }

    if (!response.ok) return { status: SessionRefreshStatus.ERROR };

    const data = await response.json();
    const accessToken = data?.results?.[0]?.accessToken;

    if (!accessToken) return { status: SessionRefreshStatus.ERROR };

    return {
      status: SessionRefreshStatus.SUCCESSFUL,
      session: { accessToken }
    };
  } catch {
    return { status: SessionRefreshStatus.ERROR };
  }
};

export const refreshSessionAtEdge = async (
  request: NextRequest
): Promise<RefreshSessionResult> =>
  requestSessionRefresh(
    buildRefreshCookieHeader(request.cookies.getAll()),
    resolveTenantId(
      request.nextUrl.hostname,
      request.nextUrl.searchParams.get(TENANT_QUERY_PARAM) ?? undefined,
      request.cookies.get(TENANT_COOKIE_NAME)?.value
    )
  );

export const clearSessionCookies = (response: NextResponse): NextResponse => {
  [ACCESS_TOKEN_COOKIE_NAME, IS_PASSWORD_CHANGED_COOKIE_NAME].forEach((name) =>
    response.cookies.set({
      name,
      value: "",
      maxAge: 0,
      ...SESSION_COOKIE_ATTRIBUTES
    })
  );

  return response;
};

export const applyRefreshedSession = (
  response: NextResponse,
  refreshedSession: RefreshedSession | null
): NextResponse => {
  if (!refreshedSession) return response;

  const maxAge = getTokenMaxAgeSeconds(refreshedSession.accessToken);

  if (maxAge <= 0) return response;

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: refreshedSession.accessToken,
    maxAge,
    ...SESSION_COOKIE_ATTRIBUTES
  });

  return response;
};
