import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ROUTES from "~community/common/constants/routes";
import { isModuleRouteRestricted } from "~community/common/utils/commonUtil";

const useModuleAccessGuard = (): void => {
  const router = useRouter();

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const roles = user?.roles;

    if (!isAuthenticated || !roles) return;

    const currentPath = router.asPath.split(/[?#]/)[0];

    if (isModuleRouteRestricted(currentPath, roles)) {
      void router.replace(ROUTES.DASHBOARD.BASE);
    }
  }, [isAuthenticated, user?.roles, router]);
};

export default useModuleAccessGuard;
