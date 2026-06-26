import { SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { ApplyLeaveToastEnums } from "~community/leave/enums/MyRequestEnums";
import { MyRequestsToastMsgKeyEnums } from "~community/leave/enums/ToastMsgKeyEnums";

interface HandleApplyLeaveApiResponseProps {
  type: ApplyLeaveToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: (key: string[], data?: Record<string, unknown>) => string;
}

export const handleApplyLeaveApiResponse = ({
  type,
  setToastMessage,
  translateText
}: HandleApplyLeaveApiResponseProps) => {
  switch (type) {
    case ApplyLeaveToastEnums.APPLY_LEAVE_SUCCESS:
      setToastMessage({
        key: MyRequestsToastMsgKeyEnums.APPLY_LEAVE_SUCCESS,
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["toastMessages.leaveAppliedSuccess.title"]),
        description: translateText([
          "toastMessages.leaveAppliedSuccess.description"
        ])
      });
      break;
    case ApplyLeaveToastEnums.APPLY_LEAVE_ERROR:
      setToastMessage({
        key: MyRequestsToastMsgKeyEnums.APPLY_LEAVE_ERROR,
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages.leaveAppliedError.title"]),
        description: translateText([
          "toastMessages.leaveAppliedError.description"
        ])
      });
      break;
    case ApplyLeaveToastEnums.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT:
      setToastMessage({
        key: MyRequestsToastMsgKeyEnums.INSUFFICIENT_BALANCE_ERROR,
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages.insufficientBalance.title"]),
        description: translateText([
          "toastMessages.insufficientBalance.description"
        ])
      });
      break;
    case ApplyLeaveToastEnums.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE:
      setToastMessage({
        key: MyRequestsToastMsgKeyEnums.NO_LEAVE_ENTITLEMENT_ERROR,
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["toastMessages.noLeaveEntitlement.title"]),
        description: translateText([
          "toastMessages.noLeaveEntitlement.description"
        ])
      });
      break;
    default:
      break;
  }
};
