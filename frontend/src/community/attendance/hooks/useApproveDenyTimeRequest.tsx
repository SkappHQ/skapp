import { useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

import { useApproveDenyTimeRequest as useApproveDenyTimeRequestAPI } from "../api/attendanceManagerApi";
import { TimeSheetRequestStates } from "../enums/timesheetEnums";

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

  const onError = () => {
    if (currentRequesAction === TimeSheetRequestStates.APPROVED) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateTexts(["approveFailTitle"]),
        description: translateTexts(["approveFailDes"], {
          name: currentRequester
        }),
        isIcon: true
      });
    } else {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateTexts(["declineFailTitle"]),
        description: translateTexts(["declineFailDes"], {
          name: currentRequester
        }),
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
