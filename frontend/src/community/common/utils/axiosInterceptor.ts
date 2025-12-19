import axios, { InternalAxiosRequestConfig } from "axios";

import { signOut } from "~community/common/context/AuthContext";
import {
  clearAuthData,
  getAccessToken,
  isTokenExpired,
  setAccessToken,
  setUserData
} from "~community/common/utils/tokenUtils";

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

/**
 * Refresh token function
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      if (data.user) {
        setUserData(data.user);
      }
      return data.accessToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAuthData();
    return null;
  }
};

const requestInterceptorConfig = async (config: InternalAxiosRequestConfig) => {
  // Skip auth for certain endpoints
  if (
    config.url?.includes("/refresh-token") ||
    config.url?.includes("/app-setup-status") ||
    config.url?.includes("/sign-in") ||
    config.url?.includes("/sign-up")
  ) {
    const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
    if (isEnterpriseMode && tenantID) {
      config.headers["X-Tenant-ID"] = tenantID;
    }
    return config;
  }

  // Get access token from localStorage
  let accessToken = getAccessToken();

  // Check if token is expired
  if (accessToken && isTokenExpired(accessToken)) {
    // Try to refresh the token
    const newToken = await refreshAccessToken();
    if (newToken) {
      accessToken = newToken;
    } else {
      // Refresh failed, sign out
      signOut();
      throw new Error("Session expired");
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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
