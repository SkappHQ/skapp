import { useEffect } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

export const useActivityLoadErrorToast = (
  isError: boolean,
  errorUpdatedAt: number
): void => {
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  useEffect(() => {
    if (!isError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activities", "feed", "errorToast", "title"]),
      description: translateText([
        "activities",
        "feed",
        "errorToast",
        "description"
      ])
    });
  }, [isError, errorUpdatedAt]);
};
