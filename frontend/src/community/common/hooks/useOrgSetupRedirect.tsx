import { useRouter } from "next/router";

import { useAuth } from "~community/common/context/AuthContext";

import ROUTES from "../constants/routes";
import { OrgSetupStatusType } from "../types/OrganizationCreateTypes";

const useOrgSetupRedirect = () => {
  const router = useRouter();

  const { status } = useAuth();

  let isSignInSessionAvailable = false;

  if (status === "authenticated") {
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
