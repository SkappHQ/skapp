import axios, { InternalAxiosRequestConfig } from "axios";

import {
  COMMON_ERROR_INVALID_REFRESH_TOKEN,
  COMMON_ERROR_MISSING_COOKIE_IN_TOKEN
} from "~community/common/constants/errorMessageKeys";
import { isEnterpriseMode } from "~community/common/utils/commonUtil";
import { getApiUrl } from "~community/common/utils/getConstants";
import { applyTenantHeader } from "~enterprise/common/utils/tenantUtil";

import { signOut } from "./authUtils";

const SIGN_OUT_ERROR_KEYS = [
  COMMON_ERROR_MISSING_COOKIE_IN_TOKEN,
  COMMON_ERROR_INVALID_REFRESH_TOKEN
];

const authAxios = axios.create({
  baseURL: getApiUrl()
});

//  request interceptor
authAxios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!isEnterpriseMode()) {
      return config;
    }

    return applyTenantHeader(config);
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
    const messageKey = error.response?.data?.results?.[0]?.messageKey;
    if (messageKey && SIGN_OUT_ERROR_KEYS.includes(messageKey)) {
      await signOut();
    }
    return await Promise.reject(error);
  }
);

export default authAxios;
