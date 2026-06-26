import { GetSessionParams, getSession } from "next-auth/react";

import { organizationCreateEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { HTTP_OK } from "~community/common/constants/httpStatusCodes";
import ROUTES from "~community/common/constants/routes";
import authFetch from "~community/common/utils/axiosInterceptor";

interface SessionPropsOptions {
  isSignInPage: boolean;
}

export async function redirectHandler(
  context: GetSessionParams | undefined,
  options: SessionPropsOptions
) {
  const { isSignInPage = false } = options;

  const session = await getSession(context);

  const response = await authFetch.get(
    organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS
  );

  if (response.status === HTTP_OK) {
    const orgSetupStatus = await response.data;

    if (orgSetupStatus?.results[0]) {
      if (!orgSetupStatus?.results[0]?.isSignUpCompleted) {
        return {
          redirect: {
            destination: ROUTES.AUTH.SIGNUP,
            permanent: false
          }
        };
      } else if (
        !orgSetupStatus?.results[0]?.isOrganizationSetupCompleted &&
        session
      ) {
        return {
          redirect: {
            destination: ROUTES.ORGANIZATION.SETUP,
            permanent: false
          }
        };
      }
    }
  }

  if (session) {
    const isPasswordChanged = session?.user?.isPasswordChangedForTheFirstTime;
    if (!isPasswordChanged) {
      return {
        redirect: {
          destination: ROUTES.AUTH.RESET_PASSWORD,
          permanent: false
        }
      };
    }
    return {
      redirect: {
        destination: ROUTES.DASHBOARD.BASE,
        permanent: false
      }
    };
  }

  if (isSignInPage) {
    return {
      props: {
        session,
        orgSetupStatus: null
      }
    };
  } else {
    return {
      redirect: {
        destination: ROUTES.AUTH.SIGNIN,
        permanent: false
      }
    };
  }
}
