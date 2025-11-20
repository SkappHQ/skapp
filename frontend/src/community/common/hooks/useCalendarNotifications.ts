import { useCallback } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

interface NotificationParams {
  success?: string;
  error?: string;
  type?: string;
}

export const useCalendarNotifications = () => {
  const translateText = useTranslator("settings");
  const { setToastMessage } = useToast();

  const showNotification = useCallback(
    (params: NotificationParams) => {
      const { success, error, type } = params;
      const userEmailMismatchError = "User email mismatch with current user";
      //eslint-disable-next-line no-console
      console.log("params received in showNotification:", params);

      const calendarType =
        type === "microsoft" || type === "outlook" ? "outlook" : "google";
      const prefix =
        calendarType === "outlook" ? "outlookCalendar" : "googleCalendar";

      let shouldShowToast = false;

      if (error === userEmailMismatchError) {
        setToastMessage({
          open: true,
          title: translateText([`${prefix}AccMismatchTitle`]),
          description: translateText([`${prefix}AccMismatchDes`]),
          toastType: ToastType.ERROR
        });
        shouldShowToast = true;
      } else if (success === "true") {
        //eslint-disable-next-line no-console
        console.log("showing success toast:" + type);
        setToastMessage({
          open: true,
          title: translateText([`${prefix}AddSuccessTitle`]),
          description: translateText([`${prefix}AddSuccessDes`]),
          toastType: ToastType.SUCCESS
        });
        shouldShowToast = true;
      } else if (success === "false") {
        setToastMessage({
          open: true,
          title: translateText([`${prefix}ErrorTitle`]),
          description: translateText([`${prefix}AddErrorDes`]),
          toastType: ToastType.ERROR
        });
        shouldShowToast = true;
      }

      // Clean up URL parameters after showing notification
      if (
        shouldShowToast &&
        typeof globalThis !== "undefined" &&
        globalThis.location
      ) {
        const currentUrl = new URL(globalThis.location.href);
        currentUrl.searchParams.delete("success");
        currentUrl.searchParams.delete("error");
        currentUrl.searchParams.delete("type");

        // Update the URL without page reload
        globalThis.history.replaceState(
          {},
          document.title,
          currentUrl.toString()
        );
      }
    },
    [translateText, setToastMessage]
  );

  return { showNotification };
};
