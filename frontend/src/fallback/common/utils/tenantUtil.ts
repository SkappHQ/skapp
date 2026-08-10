import { InternalAxiosRequestConfig } from "axios";

export const normalizeTenantId = (): string => "";

export const getHostSubdomain = (): string => "";

export const isAuthHost = (): boolean => false;

export const isTenantSelectionHost = (): boolean => false;

export const getTenantId = (): string => "";

export const applyTenantHeader = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => config;

export const getTenantHostUrl = (): string => "";

export const getTenantQueryPath = (): string => "";
