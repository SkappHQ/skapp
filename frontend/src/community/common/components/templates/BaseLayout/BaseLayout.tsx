import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  IsAProtectedUrlWithAppBarOnly,
  IsAProtectedUrlWithDrawer
} from "~community/auth/utils/authUtils";
import SkipToContentPopup from "~community/common/components/atoms/SkipToContentPopup/SkipToContentPopup";
import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import CommonModalController from "~community/common/components/organisms/CommonModalController/CommonModalController";
import ContentWithAppBar from "~community/common/components/organisms/ContentWithAppBar/ContentWithAppBar";
import ContentWithDrawer from "~community/common/components/organisms/ContentWithDrawer/ContentWithDrawer";
import ContentWithoutDrawer from "~community/common/components/organisms/ContentWithoutDrawer/ContentWithoutDrawer";
import { appModes } from "~community/common/constants/configs";
import useSessionData from "~community/common/hooks/useSessionData";
import BirthdayModalController from "~community/people/components/organisms/BirthdayModalController/BirthdayModalController";
import { BirthdayNotificationProvider } from "~community/people/providers/BirthdayNotificationProvider";
import { setDeviceToken } from "~enterprise/common/api/setDeviceTokenApi";
import LogoColorLoader from "~enterprise/common/components/molecules/LogoColorLoader/LogoColorLoader";
import useFcmToken from "~enterprise/common/hooks/useFCMToken";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { getTenantId } from "~enterprise/common/utils/tenantUtil";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";

interface Props {
  children: ReactNode;
}

const BaseLayout = ({ children }: Props) => {
  const { asPath } = useRouter();

  const { sessionStatus } = useSessionData();

  const { token } = useFcmToken();

  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

  const [isClient, setIsClient] = useState<boolean>(false);

  const { setGlobalLoginMethod } = useCommonEnterpriseStore(
    useShallow((state) => ({
      setGlobalLoginMethod: state.setGlobalLoginMethod
    }))
  );

  const { data: globalLogin, isLoading: isGlobalLoginMethodLoading } =
    useGetGlobalLoginMethod(isEnterprise, getTenantId());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (globalLogin) {
      setGlobalLoginMethod(globalLogin);
    }
  }, [globalLogin]);

  const isProtectedRouteWithDrawer = useMemo(() => {
    return isClient ? IsAProtectedUrlWithDrawer(asPath) : false;
  }, [asPath, isClient]);

  const isProtectedRouteWithAppBarOnly = useMemo(() => {
    return isClient ? IsAProtectedUrlWithAppBarOnly(asPath) : false;
  }, [asPath, isClient]);

  useEffect(() => {
    if (
      (isProtectedRouteWithDrawer || isProtectedRouteWithAppBarOnly) &&
      token
    ) {
      setDeviceToken(token);
    }
  }, [isProtectedRouteWithDrawer, isProtectedRouteWithAppBarOnly, token]);

  const renderComponent = useMemo(() => {
    switch (sessionStatus) {
      case "loading":
        return <FullScreenLoader />;
      case "authenticated": {
        if (isEnterprise && isGlobalLoginMethodLoading) {
          if (asPath === "/settings?status=success") return <LogoColorLoader />;
          return <FullScreenLoader />;
        }

        if (isProtectedRouteWithAppBarOnly) {
          return (
            <>
              <SkipToContentPopup />
              <ContentWithAppBar>{children}</ContentWithAppBar>
            </>
          );
        }

        if (isProtectedRouteWithDrawer) {
          return (
            <>
              <SkipToContentPopup />
              <ContentWithDrawer>{children}</ContentWithDrawer>
            </>
          );
        }

        return (
          <>
            <SkipToContentPopup signedInUser={false} />
            <ContentWithoutDrawer>{children}</ContentWithoutDrawer>
          </>
        );
      }
      case "unauthenticated":
        return (
          <>
            <SkipToContentPopup signedInUser={false} />
            <ContentWithoutDrawer>{children}</ContentWithoutDrawer>
          </>
        );
      default:
        return <></>;
    }
    // NOTE: Do not change these dependencies, or this will break
  }, [
    sessionStatus,
    children,
    isEnterprise,
    isGlobalLoginMethodLoading,
    isProtectedRouteWithDrawer,
    isProtectedRouteWithAppBarOnly
  ]);

  const shouldShowBirthdayNotifications =
    sessionStatus === "authenticated" &&
    (isProtectedRouteWithDrawer || isProtectedRouteWithAppBarOnly);

  return (
    <>
      {renderComponent}
      <CommonModalController />
      {shouldShowBirthdayNotifications && (
        <BirthdayNotificationProvider>
          <BirthdayModalController />
        </BirthdayNotificationProvider>
      )}
    </>
  );
};

export default BaseLayout;
