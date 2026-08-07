import { getCookieValue } from "./commonUtil";

const SELECTED_TENANT_STORAGE_KEY = "selectedTenantId";

const TENANT_COOKIE_NAME = "tenant";

export const getSubDomain = (
  url: string,
  multipleValues: boolean = false
): string | string[] => {
  const subdomain = multipleValues ? url.split(".") : url.split(".")[0];
  return subdomain;
};

export const getBaseDomain = (host: string): string =>
  host.split(".").slice(1).join(".");

export const setSelectedTenantId = (tenantId: string): void => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SELECTED_TENANT_STORAGE_KEY, tenantId);
};

export const clearSelectedTenantId = (): void => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SELECTED_TENANT_STORAGE_KEY);
};

export const getTenantIdFromCookie = (): string | undefined =>
  getCookieValue(TENANT_COOKIE_NAME) ?? undefined;

export const getTenantId = (): string => {
  if (typeof window === "undefined") return "";
  return (
    window.sessionStorage.getItem(SELECTED_TENANT_STORAGE_KEY) ||
    (getSubDomain(window.location.hostname) as string)
  );
};
