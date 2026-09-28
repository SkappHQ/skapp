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
  const [currentRequesAction, setCurrentRequestAction] = useState<string>();
  const [pendingTimeRequestId, setPendingTimeRequestId] = useState<
    number | null
  >(null);

  const [isRequestInFlight, setIsRequestInFlight] = useState(false);

  const resetPendingRequest = (): void => {
    setIsRequestInFlight(false);
    setPendingTimeRequestId(null);
  };

  const handleSuccess = () => {
    resetPendingRequest();

    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateTexts(["approveSuccessTitle"]),
        description: translateTexts(["approveSuccessDes"]),
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateTexts(["declineSuccessTitle"]),
        description: translateTexts(["declineSuccessDes"]),
        isIcon: true
      });
    }
  };

  const handleError = (messageKey: string) => {
    resetPendingRequest();

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

  const handleTimesheetRequest = (
    timeRequestId: number,
    status: TimeSheetRequestStates
  ): void => {
    if (isRequestInFlight) return;

    setIsRequestInFlight(true);
    setPendingTimeRequestId(timeRequestId);
    setCurrentRequestAction(status);

    approveDenyRequest({
      id: timeRequestId,
      status
    });
  };

  const approveTimesheetRequest = (timeRequestId: number): void => {
    handleTimesheetRequest(timeRequestId, TimeSheetRequestStates.APPROVED);
  };

  const declineTimesheetRequest = (timeRequestId: number): void => {
    handleTimesheetRequest(timeRequestId, TimeSheetRequestStates.DENIED);
  };

  return {
    approveTimesheetRequest,
    declineTimesheetRequest,
    isApproveDenyLoading,
    pendingTimeRequestId,
    currentRequesAction
  };
};

export default useApproveDenyTimeRequest;
