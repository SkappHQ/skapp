import { useState } from "react";

import { TIME_ERROR_TIME_REQUEST_CANNOT_EDIT } from "~community/common/constants/errorMessageKeys";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

import { useApproveDenyTimeRequest as useApproveDenyTimeRequestAPI } from "../api/attendanceManagerApi";
import { TimeSheetRequestStates } from "../enums/timesheetEnums";

const useApproveDenyTimeRequest = () => {
  const translateTexts = useTranslator("attendanceModule", "timesheet");
  const { setToastMessage } = useToast();
  const [currentRequester, setCurrentRequester] = useState<string>();
  const [currentRequesAction, setCurrentRequestAction] = useState<string>();

  const handleSuccess = () => {
    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateTexts(["approveSuccessTitle"]),
        description: translateTexts(["approveSuccessDes"], {
          name: currentRequester
        }),
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateTexts(["declineSuccessTitle"]),
        description: translateTexts(["declineSuccessDes"], {
          name: currentRequester
        }),
        isIcon: true
      });
    }
  };

  const handleError = (messageKey: string) => {
    const isStaleRequest = messageKey === TIME_ERROR_TIME_REQUEST_CANNOT_EDIT;

    if (isStaleRequest) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateTexts(["staleRequestConflictTitle"]),
        description: translateTexts(["staleRequestConflictDes"])
      });
      return;
    }

    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateTexts(["approveFailTitle"]),
        description: translateTexts(["approveFailDes"]),
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateTexts(["declineFailTitle"]),
        description: translateTexts(["declineFailDes"]),
        isIcon: true
      });
    }
  };

  const { mutate: approveDenyRequest, isPending: isApproveDenyLoading } =
    useApproveDenyTimeRequestAPI(handleSuccess, handleError);

  const approveTimesheetRequest = (timeRequestId: number, name: string) => {
    setCurrentRequester(name);
    setCurrentRequestAction(TimeSheetRequestStates.APPROVED);
    approveDenyRequest({
      id: timeRequestId,
      status: TimeSheetRequestStates.APPROVED
    });
  };

  const declineTimesheetRequest = (timeRequestId: number, name: string) => {
    setCurrentRequester(name);
    setCurrentRequestAction(TimeSheetRequestStates.DENIED);
    approveDenyRequest({
      id: timeRequestId,
      status: TimeSheetRequestStates.DENIED
    });
  };

  return {
    approveTimesheetRequest,
    declineTimesheetRequest,
    isApproveDenyLoading
  };
};

export default useApproveDenyTimeRequest;
