import { useCallback, useEffect, useMemo, useState } from "react";

import { CalendarType } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useConnectGoogleCalendar,
  useConnectMicrosoftCalendar,
  useDisconnectGoogleCalendar,
  useDisconnectMicrosoftCalendar,
  useIsGoogleCalendarConnected,
  useIsMicrosoftCalendarConnected
} from "~enterprise/common/api/CalendarApi";

export const useCalendarIntegrations = (
  frontendRedirectUrl: string,
  organizationCalendarStatusData: any,
  globalLoginMethod: string,
  setCurrentCalendarType?: (type: string) => void
) => {
  const translateText = useTranslator("settings");
  const { setToastMessage } = useToast();

  // State
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isMicrosoftConnected, setIsMicrosoftConnected] =
    useState<boolean>(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] =
    useState<boolean>(false);

  // Generic success handler factory
  const createSuccessHandler = useCallback(
    (calendarType: CalendarType) => {
      return (data: any) => {
        if (data?.authUrl) {
          globalThis.location.href = data.authUrl;
          return;
        }

        const prefix =
          calendarType === CalendarType.MICROSOFT
            ? "outlookCalendar"
            : "googleCalendar";
        const isConnected =
          calendarType === CalendarType.MICROSOFT
            ? isMicrosoftConnected
            : isGoogleConnected;

        setToastMessage({
          open: true,
          title: translateText([
            `${prefix}${isConnected ? "Remove" : "Add"}SuccessTitle`
          ]),
          description: translateText([
            `${prefix}${isConnected ? "Remove" : "Add"}SuccessDes`
          ]),
          toastType: ToastType.SUCCESS
        });

        if (calendarType === CalendarType.MICROSOFT) {
          setIsMicrosoftConnected(!isMicrosoftConnected);
        } else {
          setIsGoogleConnected(!isGoogleConnected);
        }
      };
    },
    [translateText, setToastMessage, isGoogleConnected, isMicrosoftConnected]
  );

  // Generic error handler factory
  const createErrorHandler = useCallback(
    (calendarType: CalendarType) => {
      return () => {
        const prefix =
          calendarType === CalendarType.MICROSOFT
            ? "outlookCalendar"
            : "googleCalendar";
        const isConnected =
          calendarType === CalendarType.MICROSOFT
            ? isMicrosoftConnected
            : isGoogleConnected;

        setToastMessage({
          open: true,
          title: translateText([`${prefix}ErrorTitle`]),
          description: translateText([
            `${prefix}${isConnected ? "Remove" : "Add"}ErrorDes`
          ]),
          toastType: ToastType.ERROR
        });
      };
    },
    [translateText, setToastMessage, isGoogleConnected, isMicrosoftConnected]
  );

  // API hooks with handlers
  const { mutate: connectGoogle, isPending: isConnectingGoogle } =
    useConnectGoogleCalendar(
      createSuccessHandler(CalendarType.GOOGLE),
      createErrorHandler(CalendarType.GOOGLE)
    );

  const { mutate: disconnectGoogle } = useDisconnectGoogleCalendar(
    createSuccessHandler(CalendarType.GOOGLE),
    createErrorHandler(CalendarType.GOOGLE)
  );

  const { mutate: connectMicrosoft, isPending: isConnectingMicrosoft } =
    useConnectMicrosoftCalendar(
      createSuccessHandler(CalendarType.MICROSOFT),
      createErrorHandler(CalendarType.MICROSOFT)
    );

  const { mutate: disconnectMicrosoft } = useDisconnectMicrosoftCalendar(
    createSuccessHandler(CalendarType.MICROSOFT),
    createErrorHandler(CalendarType.MICROSOFT)
  );

  // Connection status checks
  const { data: isGoogleCalendarConnectedData, isPending: isGooglePending } =
    useIsGoogleCalendarConnected();
  const {
    data: isMicrosoftCalendarConnectedData,
    isPending: isMicrosoftPending
  } = useIsMicrosoftCalendarConnected();

  const createRedirectUrl = useCallback(
    (baseUrl: string, calendarType: string) => {
      const url = new URL(baseUrl);
      url.searchParams.set("success", "true");
      url.searchParams.set("type", calendarType);
      return url.toString();
    },
    []
  );

  // Update connection status when data loads
  useEffect(() => {
    if (isGoogleCalendarConnectedData !== undefined) {
      setIsGoogleConnected(isGoogleCalendarConnectedData);
    }
  }, [isGoogleCalendarConnectedData]);

  useEffect(() => {
    if (isMicrosoftCalendarConnectedData !== undefined) {
      setIsMicrosoftConnected(isMicrosoftCalendarConnectedData);
    }
  }, [isMicrosoftCalendarConnectedData]);

  // Integration configurations
  const integrationConfigs = useMemo(() => {
    const configs = [];

    // Google Calendar
    if (
      organizationCalendarStatusData?.isGoogleCalendarEnabled &&
      (globalLoginMethod === "GOOGLE" || globalLoginMethod === "CREDENTIALS")
    ) {
      configs.push({
        id: "google",
        type: CalendarType.GOOGLE,
        calendarType: "google",
        isConnected: isGoogleConnected,
        onToggle: () => {
          setCurrentCalendarType?.("google");

          if (isGoogleConnected) {
            setIsGoogleModalOpen(true);
          } else {
            const redirectUrl = createRedirectUrl(
              frontendRedirectUrl,
              "google"
            );
            connectGoogle(redirectUrl);
          }
        },
        onDisconnect: () => {
          disconnectGoogle();
          setIsGoogleModalOpen(false);
        },
        modalOpen: isGoogleModalOpen,
        setModalOpen: setIsGoogleModalOpen,
        btnLoading: isGooglePending || isConnectingGoogle
      });
    }

    // Microsoft Calendar
    if (
      organizationCalendarStatusData?.isMicrosoftCalendarEnabled &&
      (globalLoginMethod === "MICROSOFT" || globalLoginMethod === "CREDENTIALS")
    ) {
      configs.push({
        id: "microsoft",
        type: CalendarType.MICROSOFT,
        calendarType: "microsoft",
        isConnected: isMicrosoftConnected,
        onToggle: () => {
          setCurrentCalendarType?.("microsoft");

          if (isMicrosoftConnected) {
            setIsMicrosoftModalOpen(true);
          } else {
            const redirectUrl = createRedirectUrl(
              frontendRedirectUrl,
              "microsoft"
            );
            connectMicrosoft(redirectUrl);
          }
        },
        onDisconnect: () => {
          disconnectMicrosoft();
          setIsMicrosoftModalOpen(false);
        },
        modalOpen: isMicrosoftModalOpen,
        setModalOpen: setIsMicrosoftModalOpen,
        btnLoading: isMicrosoftPending || isConnectingMicrosoft
      });
    }

    return configs;
  }, [
    organizationCalendarStatusData,
    globalLoginMethod,
    isGoogleConnected,
    isMicrosoftConnected,
    frontendRedirectUrl,
    isGooglePending,
    isConnectingGoogle,
    isMicrosoftPending,
    isConnectingMicrosoft,
    connectGoogle,
    connectMicrosoft,
    isGoogleModalOpen,
    isMicrosoftModalOpen,
    setCurrentCalendarType
  ]);

  return {
    integrationConfigs,
    isGoogleConnected,
    isMicrosoftConnected
  };
};
