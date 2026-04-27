import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import StatusPopupRow from "~community/leave/components/molecules/StatusPopupRow/StatusPopupRow";
import { useLeaveStore } from "~community/leave/store/store";
import {
  getStartEndDate,
  handleDurationDay,
  handleLeaveStatus,
  leaveStatusIconSelector
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

import AttachmentRow from "../../AttachmentRow/AttachmentRow";

interface Props {
  handleRequestStatusPopup: () => void;
}

const EmployeeLeaveRequestCancelledPopup: FC<Props> = ({
  handleRequestStatusPopup
}) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("leaveModule", "myRequests");
  const { employeeLeaveRequestData } = useLeaveStore((state) => state);

  const handelProceedToHome = (): void => {
    handleRequestStatusPopup();
  };

  return (
    <>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.grey[400],
          marginTop: "1rem"
        }}
        tabIndex={0}
      >
        {translateText(["myLeaveRequests", "leaveRequestCancelledDescription"])}
      </Typography>

      <Box
        sx={{
          marginTop: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          padding: "0.75rem"
        }}
      >
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "type"])}
          iconName={employeeLeaveRequestData?.leaveType.name}
          icon={employeeLeaveRequestData?.leaveType.emojiCode}
        />
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "status"])}
          iconName={handleLeaveStatus(employeeLeaveRequestData.status)}
          icon={leaveStatusIconSelector(employeeLeaveRequestData.status)}
        />
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "duration"])}
          durationByDays={handleDurationDay(
            employeeLeaveRequestData.durationDays,
            employeeLeaveRequestData.leaveState,
            translateText
          )}
          durationDate={getStartEndDate(
            employeeLeaveRequestData.startDate,
            employeeLeaveRequestData.endDate
          )}
        />
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "recipient"])}
          isRecipient={true}
          styles={{ alignItems: "flex-start" }}
          textStyles={{ mt: "0.75rem" }}
          reviewer={employeeLeaveRequestData.reviewer ?? undefined}
        />
        <AttachmentRow attachments={employeeLeaveRequestData?.attachments} />
        <ButtonV2
          variant={"primary"}
          onClick={handelProceedToHome}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "proceedToHome"])}
        </ButtonV2>
      </Box>
    </>
  );
};

export default EmployeeLeaveRequestCancelledPopup;
