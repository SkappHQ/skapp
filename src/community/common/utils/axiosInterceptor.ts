import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

import { COMMON_ERROR_TOKEN_EXPIRED } from "../constants/errorMessageKeys";
import { HTTP_FORBIDDEN } from "../constants/httpStatusCodes";
import ROUTES from "../constants/routes";
import { getApiUrl } from "./getConstants";

const getSubDomain = (url: string, multipleValues: boolean = false) => {
  const subdomain = multipleValues ? url.split(".") : url.split(".")[0];
  return subdomain;
};

export const tenantID =
  typeof window !== "undefined" ? getSubDomain(window.location.hostname) : "";

const authFetch = axios.create({
  baseURL: getApiUrl()
});

//  request interceptor
authFetch.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();

    if (
      session?.user.accessToken &&
      !config.url?.includes("/refresh-token") &&
      !config.url?.includes("/app-setup-status")
    ) {
      config.headers.Authorization = `Bearer ${session?.user.accessToken}`;
    }

    const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
    if (isEnterpriseMode && tenantID) {
      config.headers["X-Tenant-ID"] = tenantID;
    }
    return config;
  },
  async (error) => {
    return await Promise.reject(error);
  }
);

//  response interceptor
authFetch.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    if (
      error.response.data.results[0].messageKey === COMMON_ERROR_TOKEN_EXPIRED
    ) {
      await signOut();
    }

    if (error.response.status === HTTP_FORBIDDEN) {
      await signOut({
        redirect: true,
        callbackUrl: ROUTES.UPDATED_PERMISSIONS
      });
    }
    return await Promise.reject(error);
  }
);

export default authFetch;
