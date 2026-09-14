import { useRouter } from "next/router";

import { sidebarHiddenRoutes } from "~community/auth/constants/routeConfigs";

const useIsSidebarHidden = (): boolean => {
  const router = useRouter();

  return sidebarHiddenRoutes.some((prefix) => router.asPath.startsWith(prefix));
};

export default useIsSidebarHidden;
