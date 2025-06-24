import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

import { organizationCreateEndpoints } from "~community/common/api/utils/ApiEndpoints";
import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import { appModes } from "~community/common/constants/configs";
import { HTTP_OK } from "~community/common/constants/httpStatusCodes";
import ROUTES from "~community/common/constants/routes";
import { APP } from "~community/common/constants/stringConstants";
import authFetch from "~community/common/utils/axiosInterceptor";

export default function Index() {
  const router = useRouter();
  const { data: session } = useSession();

  const tenantId = window.location.host.split(".")[0];

  const handleNavigation = useCallback(async () => {
    const isEnterprise = process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE;

    if (isEnterprise) {
      if (tenantId === APP) {
        signOut({
          redirect: false
        });
        await router.replace(ROUTES.AUTH.SIGNIN);
      } else {
        const route = session ? ROUTES.DASHBOARD.BASE : ROUTES.AUTH.SIGNIN;
        await router.replace(route);
      }
    } else {
      try {
        const response = await authFetch.get(
          organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS
        );

        if (response.status !== HTTP_OK || !response.data?.results?.[0]) {
          await router.replace(ROUTES.AUTH.SIGNIN);
          return;
        }

        const orgData = response.data;
        const setupStatus = orgData.results[0];

        if (!setupStatus.isSignUpCompleted) {
          await router.replace(ROUTES.AUTH.SIGNUP);
        } else if (!setupStatus.isOrganizationSetupCompleted && session) {
          await router.replace(ROUTES.ORGANIZATION.SETUP);
        } else {
          await router.replace(ROUTES.DASHBOARD.BASE);
        }
      } catch (error) {
        await router.replace(ROUTES.AUTH.SIGNIN);
      }
    }
  }, []);

  useEffect(() => {
    handleNavigation();
  }, []);

  return <FullScreenLoader />;
}
