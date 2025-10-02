import { Box, Stack } from "@mui/material";
import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useHandelLeaves } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveExtraPopupTypes,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";
import { validateDescription } from "~community/leave/utils/LeavePreprocessors";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import LeaveStatusPopupColumn from "../LeaveStatusPopupColumn/LeaveStatusPopupColumn";

interface Props {
  closeModel: () => void;
  setPopupType: Dispatch<SetStateAction<string>>;
}

const ManagerDeclineLeaveModal = ({
  closeModel,
  setPopupType
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const { setToastMessage } = useToast();

  const leaveRequestData = useLeaveStore((state) => state.leaveRequestData);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const { mutate, isSuccess, error: leaveCancelError } = useHandelLeaves();

  const { sendEvent } = useGoogleAnalyticsEvent();

  const handelDecline = (): void => {
    if (validateDescription(reason)) setError(true);
    else {
      setError(false);
      const data = {
        leaveRequestId: leaveRequestData.leaveId as number,
        status: LeaveStatusTypes.DENIED.toUpperCase(),
        reviewerComment: reason
      };
      mutate(data);
    }
  };

  useEffect(() => {
    if (leaveCancelError) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["declineLeaveFailTitle"]),
        description: translateText(["declineLeaveFailDesc"]),
        isIcon: true
      });
    } else if (isSuccess) {
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["declineLeaveSuccessTitle"]),
        description: translateText(["declineLeaveSuccessDesc"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_DECLINED);
      setPopupType(LeaveExtraPopupTypes.DECLINE_STATUS);
    }
  }, [leaveRequestData?.empName, leaveCancelError, isSuccess]);

  return (
    <Box component="div" aria-modal={true}>
      <Box sx={{ pb: "1rem" }}>
        <LeaveStatusPopupColumn
          id="reason"
          label={translateText(["reasonToDecline"])}
          text={reason}
          setInputText={setReason}
          error={error}
          errorMessage={translateText(["EnterWhyDecline"])}
          required
        />
      </Box>
      <Stack spacing={2}>
        <Button
          buttonStyle={ButtonStyle.ERROR}
          label="Decline Leave"
          endIcon={<CloseIcon />}
          onClick={handelDecline}
        />
        <Button
          buttonStyle={ButtonStyle.TERTIARY}
          label="Cancel"
          endIcon={<CloseIcon />}
          onClick={closeModel}
        />
      </Stack>
    </Box>
  );
};

export default ManagerDeclineLeaveModal;
