import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { organizationCreateEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { appModes } from "~community/common/constants/configs";
import { HTTP_OK } from "~community/common/constants/httpStatusCodes";
import ROUTES from "~community/common/constants/routes";
import authFetch from "~community/common/utils/axiosInterceptor";

interface SessionPropsOptions {
  isSignInPage: boolean;
}

export const useRedirectHandler = (options: SessionPropsOptions) => {
  const { isSignInPage = false } = options;
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const session = await getSession();

      try {
        if (process.env.NEXT_PUBLIC_MODE !== "enterprise") {
          const response = await authFetch.get(
            organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS
          );

          if (response.status === HTTP_OK) {
            const orgSetupStatus = await response.data;

            if (orgSetupStatus?.results[0]) {
              if (!orgSetupStatus?.results[0]?.isSignUpCompleted) {
                window.location.href = ROUTES.AUTH.SIGNUP;
                return;
              } else if (
                !orgSetupStatus?.results[0]?.isOrganizationSetupCompleted &&
                session
              ) {
                router.replace(ROUTES.ORGANIZATION.SETUP);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during redirect handling:", error);
        if (!session && !isSignInPage) {
          router.replace(ROUTES.AUTH.SIGNIN);
        }
      }
    };

    if (process.env.NEXT_PUBLIC_MODE !== appModes.ENTERPRISE) {
      handleRedirect();
    }
  }, [isSignInPage, router]);
};
