import axios, { InternalAxiosRequestConfig } from "axios";

import { COMMON_ERROR_MISSING_COOKIE_IN_TOKEN } from "~community/common/constants/errorMessageKeys";
import { tenantID } from "~community/common/utils/axiosInterceptor";
import { getApiUrl } from "~community/common/utils/getConstants";

import { signOut } from "./authUtils";

const authAxios = axios.create({
  baseURL: getApiUrl()
});

//  request interceptor
authAxios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tenantID) {
      config.headers["X-Tenant-ID"] = tenantID;
    }

    return config;
  },
  async (error) => {
    return await Promise.reject(error);
  }
);

//  response interceptor
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    if (
      error.response?.data?.results?.[0]?.messageKey ===
      COMMON_ERROR_MISSING_COOKIE_IN_TOKEN
    ) {
      await signOut();
    }
    return await Promise.reject(error);
  }
);

export default authAxios;
