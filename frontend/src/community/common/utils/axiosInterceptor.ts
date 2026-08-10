import axios, { InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "~community/auth/utils/authUtils";
import { applyTenantHeader } from "~enterprise/common/utils/tenantUtil";

import { ApiVersions, appModes } from "../constants/configs";
import { getApiUrl } from "./getConstants";

const authFetch = axios.create({
  baseURL: getApiUrl() + ApiVersions.V1
});

export const authFetchV2 = axios.create({
  baseURL: getApiUrl() + ApiVersions.V2
});

export const authFetchSameOrigin = axios.create({
  baseURL: "",
  withCredentials: true
});

const requestInterceptorConfig = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await getAccessToken();

  if (
    accessToken &&
    !config.url?.includes("/refresh-token") &&
    !config.url?.includes("/app-setup-status")
  ) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (process.env.NEXT_PUBLIC_MODE !== appModes.ENTERPRISE) {
    return config;
  }

  return applyTenantHeader(config);
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

authFetchSameOrigin.interceptors.request.use(
  requestInterceptorConfig,
  requestInterceptorConfigError
);

export default authFetch;
