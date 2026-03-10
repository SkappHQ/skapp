import { Box, Stack } from "@mui/material";
import { Dispatch, JSX, SetStateAction, useEffect } from "react";

import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import UndoIcon from "~community/common/assets/Icons/UndoIcon";
import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { getAsDaysString } from "~community/common/utils/dateTimeUtils";
import { useHandelLeaves } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveExtraPopupTypes,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import LeaveStatusPopupRow from "../LeaveStatusPopupRow/LeaveStatusPopupRow";

interface Props {
  closeModel: () => void;
  popupType: string;
  setPopupType: Dispatch<SetStateAction<string>>;
}

const LeaveManagerSuccessModal = ({
  closeModel,
  popupType,
  setPopupType
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const { mutate, isSuccess, error: leaveError } = useHandelLeaves();
  const data = useLeaveStore((state) => state.leaveRequestData);
  const { setToastMessage } = useToast();

  const { sendEvent } = useGoogleAnalyticsEvent();

  const handelUndo = (): void => {
    const requestData = {
      leaveRequestId: data.leaveId as number,
      status: LeaveStatusTypes.REVOKED.toUpperCase(),
      reviewerComment: ""
    };
    mutate(requestData);
  };

  useEffect(() => {
    if (isSuccess) {
      setPopupType("");
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["revokeLeaveSuccessTitle"]),
        description: translateText(["revokeLeaveSuccessDesc"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_REVOKED);
      closeModel();
    } else if (leaveError) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["revokeLeaveFailTitle"]),
        description: translateText(["revokeLeaveFailDesc"]),
        isIcon: true
      });
    }
  }, [isSuccess, setPopupType]);

  return (
    <Box>
      <Box sx={{ pt: ".75rem", pb: "1rem" }}>
        <LeaveStatusPopupRow
          label={translateText(["member"])}
          isRecipient={true}
          styles={{ mb: "1.25rem" }}
          role="member"
          employee={data}
          profilePicture={data?.avatarUrl}
        />
        <LeaveStatusPopupRow
          label={translateText(["duration"])}
          durationByDays={getAsDaysString(data?.durationDays as string)}
          durationDate={data?.dates ?? ""}
          styles={{ mb: "1.25rem" }}
        />
        <LeaveStatusPopupRow
          label={translateText(["type"])}
          iconType={data?.leaveType ?? ""}
          styles={{ mb: "1.25rem" }}
          aria-label={`Leave request type is ${data?.leaveType ?? ""}`}
          icon={data?.leaveEmoji}
        />
        <LeaveStatusPopupRow
          label={translateText(["status"])}
          iconType={
            popupType === LeaveStatusTypes.APPROVED ||
            LeaveExtraPopupTypes.APPROVED_STATUS === popupType
              ? LeaveStatusTypes.APPROVED
              : popupType === LeaveStatusTypes.CANCELLED
                ? LeaveStatusTypes.CANCELLED
                : popupType === LeaveStatusTypes.DENIED ||
                    popupType === LeaveExtraPopupTypes.DECLINE_STATUS
                  ? LeaveStatusTypes.DENIED
                  : LeaveStatusTypes.REVOKED
          }
          styles={{ mb: "1.25rem" }}
          icon={
            popupType === LeaveStatusTypes.APPROVED ||
            LeaveExtraPopupTypes.APPROVED_STATUS === popupType ? (
              <Icon name={IconName.APPROVED_STATUS_ICON} />
            ) : popupType === LeaveStatusTypes.DENIED ||
              popupType === LeaveExtraPopupTypes.DECLINE_STATUS ? (
              <Icon name={IconName.DENIED_STATUS_ICON} />
            ) : popupType === LeaveStatusTypes.REVOKED ? (
              <Icon name={IconName.REVOKED_STATUS_ICON} />
            ) : (
              <Icon name={IconName.CANCELLED_STATUS_ICON} />
            )
          }
        />
      </Box>
      <Stack spacing={2}>
        <Button onClick={closeModel} icon={<RightArrowIcon />} iconPosition="end">{translateText(["proceedToDashboard"])}</Button>
        {(popupType === LeaveStatusTypes.APPROVED ||
          LeaveExtraPopupTypes.APPROVED_STATUS === popupType) && (
          <Button variant={"tertiary"} onClick={handelUndo} icon={<UndoIcon />} iconPosition="start">{translateText(["revokeLeave"])}</Button>
        )}
      </Stack>
    </Box>
  );
};

export default LeaveManagerSuccessModal;
