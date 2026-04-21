import { useRouter } from "next/router";

import ROUTES from "../constants/routes";
import { OrgSetupStatusType } from "../types/OrganizationCreateTypes";
import { useAuth } from "~community/auth/providers/AuthProvider";

const useOrgSetupRedirect = () => {
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  let isSignInSessionAvailable = false;

  if (isAuthenticated) {
    isSignInSessionAvailable = true;
  }
  const navigateByStatus = (orgSetupStatus: OrgSetupStatusType) => {
    if (orgSetupStatus.isSignUpCompleted) {
      if (orgSetupStatus.isOrganizationSetupCompleted) {
        router.replace(
          isSignInSessionAvailable ? ROUTES.DASHBOARD.BASE : ROUTES.AUTH.SIGNUP
        );
      } else {
        router.replace(
          isSignInSessionAvailable
            ? ROUTES.ORGANIZATION.SETUP
            : ROUTES.AUTH.SIGNUP
        );
      }
    }
  };

  return { navigateByStatus };
};

export default useOrgSetupRedirect;
