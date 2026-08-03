import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ROUTES from "~community/common/constants/routes";
import { isModuleRouteRestricted } from "~community/common/utils/commonUtil";

/**
 * Re-checks module access on the client whenever the user's roles change.
 *
 * `middleware.ts` is the only place route access is enforced, and it only runs on
 * document requests. Client side navigations never reach the edge, so a user who is
 * already inside a module keeps viewing it after an admin removes their role: the
 * drawer recomputes from `user.roles` and hides the module, the page does not.
 *
 * A hard refresh does not recover either, because the middleware authorises from the
 * roles inside the access token cookie, and that cookie is only replaced later, once
 * an API call returns a user version mismatch.
 */
const useModuleAccessGuard = (): void => {
  const router = useRouter();

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const roles = user?.roles;

    if (!isAuthenticated || !roles) return;

    // `asPath` holds the public url, `pathname` holds the rewritten page path
    const currentPath = router.asPath.split(/[?#]/)[0];

    if (isModuleRouteRestricted(currentPath, roles)) {
      void router.replace(ROUTES.DASHBOARD.BASE);
    }
  }, [isAuthenticated, user?.roles, router]);
};

export default useModuleAccessGuard;
