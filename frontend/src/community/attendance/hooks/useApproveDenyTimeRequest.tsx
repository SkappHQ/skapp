import { useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

import { useApproveDenyTimeRequest as useApproveDenyTimeRequestAPI } from "../api/attendanceManagerApi";
import { TimeSheetRequestStates } from "../enums/timesheetEnums";

// Returned when the request is no longer Pending, i.e. it was already resolved or was
// auto-cancelled by a direct save for the same employee and date.
const TIME_REQUEST_CANNOT_EDIT_MESSAGE_KEY =
  "api.error.time.time-request-cannot-edit";

const STALE_CONFLICT_TOAST_DURATION = 4000;

const useApproveDenyTimeRequest = () => {
  const translateTexts = useTranslator("attendanceModule", "timesheet");
  const { setToastMessage } = useToast();
  const [currentRequester, setCurrentRequester] = useState<string>();
  const [currentRequesAction, setCurrentRequestAction] = useState<string>();

  const onSuccess = () => {
    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateTexts(["approveSuccessTitle"]),
        description: translateTexts(["approveSuccessDes"], {
          name: currentRequester
        }),
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateTexts(["declineSuccessTitle"]),
        description: translateTexts(["declineSuccessDes"], {
          name: currentRequester
        }),
        isIcon: true
      });
    }
  };

  const onError = (error?: any) => {
    // The server rejects any transition out of a status that is no longer Pending, which
    // is what a row auto-cancelled by a direct save looks like from here. That is a
    // different situation from a failed write, so it gets its own message rather than
    // "please try again" on something retrying cannot fix.
    const isStaleRequest =
      error?.response?.data?.results?.[0]?.messageKey ===
      TIME_REQUEST_CANNOT_EDIT_MESSAGE_KEY;

    if (isStaleRequest) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateTexts(["staleRequestConflictTitle"]),
        description: translateTexts(["staleRequestConflictDes"]),
        autoHideDuration: STALE_CONFLICT_TOAST_DURATION,
        isIcon: true
      });
      return;
    }

    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateTexts(["approveFailTitle"]),
        description: translateTexts(["approveFailDes"]),
        // A failed action must not scroll past unnoticed while the row still needs
        // resolving, so it stays until dismissed.
        autoHideDuration: null,
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateTexts(["declineFailTitle"]),
        description: translateTexts(["declineFailDes"]),
        autoHideDuration: null,
        isIcon: true
      });
    }
  };

  const { mutate: approveDenyRequest, isPending: isApproveDenyLoading } =
    useApproveDenyTimeRequestAPI(onSuccess, onError);

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
