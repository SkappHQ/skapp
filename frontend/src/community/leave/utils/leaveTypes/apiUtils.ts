import { NextRouter } from "next/router";
import * as React from "react";

import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { LeaveTypeToastEnums } from "~community/leave/enums/LeaveTypeEnums";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

export const handleLeaveTypeApiResponse =
  ({
    type,
    setToastMessage,
    translateText,
    setFormDirty,
    redirect,
    stopAllOngoingQuickSetup,
    setQuickSetupModalType,
    isOngoingSetupLeave,
    sendEvent
  }: {
    type: LeaveTypeToastEnums;
    setToastMessage: (value: React.SetStateAction<ToastProps>) => void;
    translateText: (key: string[]) => string;
    setFormDirty?: (value: boolean) => void;
    redirect?: NextRouter["replace"];
    stopAllOngoingQuickSetup?: () => void;
    setQuickSetupModalType?: (value: QuickSetupModalTypeEnums) => void;
    isOngoingSetupLeave?: boolean;
    sendEvent?: (eventType: GoogleAnalyticsTypes) => void;
  }) =>
  async () => {
    switch (type) {
      case LeaveTypeToastEnums.ADD_LEAVE_TYPE_SUCCESS:
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["addLeaveTypeSuccessToastTitle"]),
          description: translateText(["addLeaveTypeSuccessToastDescription"])
        });
        setFormDirty?.(false);
        await redirect?.(ROUTES.LEAVE.LEAVE_TYPES);
        if (isOngoingSetupLeave) {
          setQuickSetupModalType?.(
            QuickSetupModalTypeEnums.IN_PROGRESS_START_UP
          );
          stopAllOngoingQuickSetup?.();
        }
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_TYPE_CREATED);
        break;
      case LeaveTypeToastEnums.ADD_LEAVE_TYPE_ERROR:
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["leaveTypeErrorToastTitle"]),
          description: translateText(["addLeaveTypeErrorToastDescription"])
        });
        break;
      case LeaveTypeToastEnums.EDIT_LEAVE_TYPE_SUCCESS:
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["editLeaveTypeSuccessToastTitle"]),
          description: translateText(["editLeaveTypeSuccessToastDescription"])
        });
        setFormDirty?.(false);
        redirect?.(ROUTES.LEAVE.LEAVE_TYPES);
        sendEvent?.(GoogleAnalyticsTypes.GA4_LEAVE_TYPE_UPDATED);
        break;
      case LeaveTypeToastEnums.EDIT_LEAVE_TYPE_ERROR:
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["leaveTypeErrorToastTitle"]),
          description: translateText(["editLeaveTypeErrorToastDescription"])
        });
        break;
      default:
        break;
    }
  };
