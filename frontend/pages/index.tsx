import { organizationCreateEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { appModes } from "~community/common/constants/configs";
import { HTTP_OK } from "~community/common/constants/httpStatusCodes";
import ROUTES from "~community/common/constants/routes";
import authFetch from "~community/common/utils/axiosInterceptor";

export async function getServerSideProps() {
  const isEnterprise = process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE;

  if (isEnterprise) {
    return {
      redirect: {
        destination: ROUTES.DASHBOARD.BASE,
        permanent: false
      }
    };
  } else {
    try {
      const response = await authFetch.get(
        organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS
      );

      if (response.status === HTTP_OK) {
        const orgSetupStatus = response.data;

        if (orgSetupStatus?.results[0]) {
          if (!orgSetupStatus?.results[0]?.isSignUpCompleted) {
            return {
              redirect: {
                destination: ROUTES.AUTH.SIGNUP,
                permanent: false
              }
            };
          } else if (
            !orgSetupStatus?.results[0]?.isOrganizationSetupCompleted
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
    } catch (error) {
      return {
        redirect: {
          destination: ROUTES.DASHBOARD.BASE,
          permanent: false
        }
      };
    }
  }

  return {
    props: {}
  };
}

export default function Index() {
  return null;
}
