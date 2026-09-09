import axios, { InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "~community/auth/utils/authUtils";
import { useCommonStore } from "~community/common/stores/commonStore";
import { getTenantId } from "~enterprise/common/utils/tenantUtil";

import { ApiVersions } from "../constants/configs";
import { getApiUrl } from "./getConstants";

const authFetch = axios.create({
  baseURL: getApiUrl() + ApiVersions.V1
});

export const authFetchV2 = axios.create({
  baseURL: getApiUrl() + ApiVersions.V2
});

const requestInterceptorConfig = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await getAccessToken(useCommonStore.getState());

  if (
    accessToken &&
    !config.url?.includes("/refresh-token") &&
    !config.url?.includes("/app-setup-status")
  ) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
  const tenantId = getTenantId();
  if (isEnterpriseMode && tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
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
