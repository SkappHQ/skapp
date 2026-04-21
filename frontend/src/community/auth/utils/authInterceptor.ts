import axios, { InternalAxiosRequestConfig } from "axios";

import { tenantID } from "~community/common/utils/axiosInterceptor";
import { getApiUrl } from "~community/common/utils/getConstants";

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
    return await Promise.reject(error);
  }
);

export default authAxios;
