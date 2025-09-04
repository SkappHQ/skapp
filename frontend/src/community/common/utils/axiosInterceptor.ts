import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

import { ApiVersions } from "../constants/configs";
import { getApiUrl } from "./getConstants";

const getSubDomain = (url: string, multipleValues: boolean = false) => {
  const subdomain = multipleValues ? url.split(".") : url.split(".")[0];
  return subdomain;
};

export const tenantID =
  typeof window !== "undefined" ? getSubDomain(window.location.hostname) : "";

const authFetch = axios.create({
  baseURL: getApiUrl() + ApiVersions.V1
});

export const authFetchV2 = axios.create({
  baseURL: getApiUrl() + ApiVersions.V2
});

const requestInterceptorConfig = async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();

  // Redirect to sign-in page if session is null
  if (!session) {
    // Check if we're in the browser environment and not already on sign-in related pages
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isOnSignInPage =
        currentPath.includes("/signin") ||
        currentPath.includes("/signup") ||
        currentPath.includes("/reset-password");

      // Only redirect if not already on authentication pages and not calling auth-related endpoints
      if (!isOnSignInPage && !config.url?.includes("/app-setup-status")) {
        window.location.href = "/signin";
        return config; // Return config to avoid promise rejection
      }
    }
  }

  if (
    session?.user.accessToken &&
    !config.url?.includes("/refresh-token") &&
    !config.url?.includes("/app-setup-status")
  ) {
    config.headers.Authorization = `Bearer ${session?.user.accessToken}`;
  } else if (session && !session?.user.accessToken) {
    signOut();
  }

  const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
  if (isEnterpriseMode && tenantID) {
    config.headers["X-Tenant-ID"] = tenantID;
  }
  return config;
};

const requestInterceptorConfigError = async (error: any) => {
  return await Promise.reject(error);
};

//  request interceptor
authFetch.interceptors.request.use(
  requestInterceptorConfig,
  requestInterceptorConfigError
);

authFetchV2.interceptors.request.use(
  requestInterceptorConfig,
  requestInterceptorConfigError
);

export default authFetch;
