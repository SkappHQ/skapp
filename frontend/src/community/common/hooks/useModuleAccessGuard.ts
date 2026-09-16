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

/**
 * Mirrors the module guards the proxy applies when a page is requested. The
 * proxy only runs on a page request, so a user whose roles change while they
 * sit on a page is never re-checked. These rules re-run that check in the
 * browser, keyed on the access token rather than on navigation.
 */
const MODULE_ACCESS_RULES: ModuleAccessRule[] = [
  {
    matches: (currentPath: string): boolean =>
      currentPath.includes(ROUTES.SIGN.BASE),
    requiredRole: EmployeeTypes.ESIGN_EMPLOYEE
  },
  {
    matches: (currentPath: string): boolean =>
      currentPath.startsWith(ROUTES.CRM.BASE),
    requiredRole: RepresentativeTypes.CRM_SALES_REPRESENTATIVE
  }
];

const toPathname = (asPath: string): string =>
  asPath.split("?")[0].split("#")[0];

export const isModuleAccessDenied = (
  currentPath: string,
  roles: string[]
): boolean =>
  MODULE_ACCESS_RULES.some(
    (rule: ModuleAccessRule) =>
      rule.matches(currentPath) && !roles.includes(rule.requiredRole)
  );

const useModuleAccessGuard = (): void => {
  const router = useRouter();

  const { accessToken } = useCommonStore(
    useShallow((state) => ({
      accessToken: state.accessToken
    }))
  );

  useEffect(() => {
    if (!accessToken) return;

    // Roles come from the token rather than the session object, because the
    // token is what a refresh replaces
    const roles: unknown = extractClaimsFromToken(accessToken)?.roles;

    // Nothing to judge against, so leave the user where they are
    if (!Array.isArray(roles) || roles.length === 0) return;

    const currentPath = toPathname(router.asPath);

    if (!isModuleAccessDenied(currentPath, roles)) return;

    void router.replace(ROUTES.DASHBOARD.BASE);
  }, [accessToken, router]);
};

export default useModuleAccessGuard;
