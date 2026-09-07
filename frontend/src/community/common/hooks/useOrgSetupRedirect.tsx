import { useCallback } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import useRouter from "~community/common/hooks/useCompatRouter";

import ROUTES from "../constants/routes";
import { OrgSetupStatusType } from "../types/OrganizationCreateTypes";

const useOrgSetupRedirect = () => {
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const navigateByStatus = useCallback(
    (orgSetupStatus: OrgSetupStatusType) => {
      if (orgSetupStatus.isSignUpCompleted) {
        let targetPath: string;
        if (orgSetupStatus.isOrganizationSetupCompleted) {
          targetPath = isAuthenticated
            ? ROUTES.DASHBOARD.BASE
            : ROUTES.AUTH.SIGNIN;
        } else {
          targetPath = isAuthenticated
            ? ROUTES.ORGANIZATION.SETUP
            : ROUTES.AUTH.SIGNUP;
        }

        if (router.pathname !== targetPath) {
          router.replace(targetPath);
        }
      }
    },
    [isAuthenticated, router]
  );

  return { navigateByStatus };
};

export default useOrgSetupRedirect;
