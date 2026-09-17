import { useRouter } from "next/router";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { extractClaimsFromToken } from "~community/auth/utils/tokenUtils";
import ROUTES from "~community/common/constants/routes";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  EmployeeTypes,
  RepresentativeTypes
} from "~community/common/types/AuthTypes";

interface ModuleAccessRule {
  matches: (currentPath: string) => boolean;
  requiredRole: string;
}

// "/signin" and "/signup" also begin with "/sign", so match whole segments
const isWithin = (currentPath: string, basePath: string): boolean =>
  currentPath === basePath || currentPath.startsWith(`${basePath}/`);

// The external signing link is public, and the proxy leaves it open too
const isUnguardedPath = (currentPath: string): boolean =>
  isWithin(currentPath, ROUTES.SIGN.DOCUMENT_ACCESS);

// Mirrors the module guards in proxy.ts, which only run on a page request
const MODULE_ACCESS_RULES: ModuleAccessRule[] = [
  {
    matches: (currentPath: string): boolean =>
      isWithin(currentPath, ROUTES.SIGN.BASE),
    requiredRole: EmployeeTypes.ESIGN_EMPLOYEE
  },
  {
    matches: (currentPath: string): boolean =>
      isWithin(currentPath, ROUTES.CRM.BASE),
    requiredRole: RepresentativeTypes.CRM_SALES_REPRESENTATIVE
  }
];

const toPathname = (asPath: string): string =>
  asPath.split("?")[0].split("#")[0];

export const isModuleAccessDenied = (
  currentPath: string,
  roles: string[]
): boolean => {
  if (isUnguardedPath(currentPath)) return false;

  return MODULE_ACCESS_RULES.some(
    (rule: ModuleAccessRule) =>
      rule.matches(currentPath) && !roles.includes(rule.requiredRole)
  );
};

/**
 * Sends a user to the dashboard when their roles stop covering the page they
 * are on. Keyed on the access token, since that is what a refresh replaces.
 */
const useModuleAccessGuard = (): void => {
  const router = useRouter();

  const { accessToken } = useCommonStore(
    useShallow((state) => ({
      accessToken: state.accessToken
    }))
  );

  useEffect(() => {
    if (!accessToken) return;

    const roles: unknown = extractClaimsFromToken(accessToken)?.roles;

    if (!Array.isArray(roles) || roles.length === 0) return;

    if (!isModuleAccessDenied(toPathname(router.asPath), roles)) return;

    void router.replace(ROUTES.DASHBOARD.BASE);
  }, [accessToken, router]);
};

export default useModuleAccessGuard;
