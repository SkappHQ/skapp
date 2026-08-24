import type { NextRequest, NextResponse } from "next/server";

import { appModes } from "~community/common/constants/configs";
import { LOCALHOST } from "~community/common/constants/stringConstants";
import { authenticationEndpoints } from "~enterprise/common/api/utils/ApiEndpoints";
import {
  TENANT_COOKIE_NAME,
  TENANT_HEADER_NAME,
  TENANT_QUERY_PARAM,
  TENANT_SELECTION_SUBDOMAINS
} from "~enterprise/common/constants/stringConstants";

import { getTokenMaxAgeSeconds } from "./tokenUtils";

const IPV4_HOSTNAME_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;

const hasTenantSubdomain = (hostname: string, subdomain: string): boolean =>
  hostname.split(".").length > 2 &&
  !IPV4_HOSTNAME_PATTERN.test(hostname) &&
  subdomain !== LOCALHOST &&
  !TENANT_SELECTION_SUBDOMAINS.includes(subdomain);

export interface RefreshedSession {
  accessToken: string;
  isPasswordChangedForTheFirstTime?: boolean;
  backendSetCookies: string[];
}

const getTenantIdFromRequest = (request: NextRequest): string => {
  const hostname = (request.nextUrl.hostname || "").toLowerCase();
  const subdomain = hostname.split(".")[0];

  if (subdomain && hasTenantSubdomain(hostname, subdomain)) {
    return subdomain;
  }

  const fromQuery = request.nextUrl.searchParams.get(TENANT_QUERY_PARAM);
  const fromCookie = request.cookies.get(TENANT_COOKIE_NAME)?.value;

  return (fromQuery || fromCookie || "").trim().toLowerCase();
};

export const refreshSessionAtEdge = async (
  request: NextRequest
): Promise<RefreshedSession | null> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const cookieHeader = request.headers.get("cookie");

  if (!apiUrl || !cookieHeader) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    cookie: cookieHeader
  };

  if (process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE) {
    const tenantId = getTenantIdFromRequest(request);
    if (tenantId) headers[TENANT_HEADER_NAME] = tenantId;
  }

  try {
    const response = await fetch(
      `${apiUrl}${authenticationEndpoints.REFRESH_TOKEN}`,
      { method: "POST", headers, body: "{}" }
    );

    if (!response.ok) return null;

    const responseHeaders = response.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const data = await response.json();
    const accessToken = data?.results?.[0]?.accessToken;

    if (!accessToken) return null;

    return {
      accessToken,
      isPasswordChangedForTheFirstTime:
        data?.results?.[0]?.isPasswordChangedForTheFirstTime,
      backendSetCookies: responseHeaders.getSetCookie?.() ?? []
    };
  } catch {
    return null;
  }
};

export const clearSessionCookies = (response: NextResponse): NextResponse => {
  ["accessToken", "isPasswordChangedForTheFirstTime"].forEach((name) =>
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      secure: true,
      httpOnly: true,
      sameSite: "lax"
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

  response.cookies.set({
    name: "accessToken",
    value: refreshedSession.accessToken,
    path: "/",
    maxAge,
    secure: true,
    httpOnly: true,
    sameSite: "lax"
  });

  if (refreshedSession.isPasswordChangedForTheFirstTime !== undefined) {
    response.cookies.set({
      name: "isPasswordChangedForTheFirstTime",
      value: String(refreshedSession.isPasswordChangedForTheFirstTime),
      path: "/",
      maxAge,
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    });
  }

  refreshedSession.backendSetCookies.forEach((cookie) =>
    response.headers.append("set-cookie", cookie)
  );

  return response;
};
