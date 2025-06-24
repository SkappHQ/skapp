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
