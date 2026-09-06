import type { NextApiRequest, NextApiResponse } from "next";

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
import { HttpMethods } from "~community/common/constants/stringConstants";
import {
  TENANT_COOKIE_NAME,
  TENANT_QUERY_PARAM
} from "~enterprise/common/constants/stringConstants";

interface ResponseData {
  messageKey: AccessTokenMessageKey;
  accessToken?: string | null;
}

const refreshAccessToken = async (
  req: NextApiRequest
): Promise<string | null> => {
  const cookies = Object.entries(req.cookies).map(([name, value]) => ({
    name,
    value: value ?? ""
  }));

  const tenantId = resolveTenantId(
    req.headers.host,
    req.query[TENANT_QUERY_PARAM]?.toString(),
    req.cookies[TENANT_COOKIE_NAME]
  );

  const result = await requestSessionRefresh(
    buildRefreshCookieHeader(cookies),
    tenantId
  );

  return result.status === SessionRefreshStatus.SUCCESSFUL
    ? result.session.accessToken
    : null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === HttpMethods.GET) {
    res.setHeader("Cache-Control", "no-store");

    const storedToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];

    if (storedToken && !isTokenExpired(storedToken)) {
      return res.status(200).json({
        messageKey: AccessTokenMessageKey.SESSION_COOKIE_READ,
        accessToken: storedToken
      });
    }

    const refreshedToken = await refreshAccessToken(req);

    if (!refreshedToken) {
      return res.status(200).json({
        messageKey: AccessTokenMessageKey.NO_ACTIVE_SESSION,
        accessToken: null
      });
    }

    res.setHeader(
      "Set-Cookie",
      buildSessionCookieHeader(
        ACCESS_TOKEN_COOKIE_NAME,
        refreshedToken,
        getTokenMaxAgeSeconds(refreshedToken)
      )
    );

    return res.status(200).json({
      messageKey: AccessTokenMessageKey.SESSION_REFRESHED,
      accessToken: refreshedToken
    });
  }

  if (req.method !== HttpMethods.POST) {
    res.setHeader("Allow", [HttpMethods.GET, HttpMethods.POST]);
    return res
      .status(405)
      .json({ messageKey: AccessTokenMessageKey.METHOD_NOT_ALLOWED });
  }

  const { accessToken, isPasswordChangedForTheFirstTime } = req.body ?? {};

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
    return res
      .status(400)
      .json({ messageKey: AccessTokenMessageKey.NOTHING_TO_SET });
  }

  res.setHeader("Set-Cookie", cookies);
  return res
    .status(200)
    .json({ messageKey: AccessTokenMessageKey.SESSION_COOKIE_UPDATED });
}
