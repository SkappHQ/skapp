import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { useRedirectHandler } from "~community/common/utils/hooks/useRedirectHandler";

export default function Index() {
  const isEnterprise = process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE;
  const router = useRouter();

  useEffect(() => {
    if (isEnterprise) {
      router.replace(ROUTES.DASHBOARD.BASE);
    }
  }, []);

  useRedirectHandler({ isSignInPage: false });

  return null;
}
