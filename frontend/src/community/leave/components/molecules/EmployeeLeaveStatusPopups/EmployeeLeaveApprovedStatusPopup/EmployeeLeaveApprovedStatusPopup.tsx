import { Box } from "@mui/material";
import { FC } from "react";

import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import StatusPopupColumn from "~community/leave/components/molecules/StatusPopupColumn/StatusPopupColumn";
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

const EmployeeLeaveApprovedStatusPopup: FC<Props> = ({
  handleRequestStatusPopup
}) => {
  const { employeeLeaveRequestData } = useLeaveStore((state) => state);
  const translateText = useTranslator("leaveModule", "myRequests");

  return (
    <>
      <Box
        sx={{
          marginTop: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
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
          label={translateText(["myLeaveRequests", "dateApplied"])}
          durationDate={convertDateToFormat(
            new Date(employeeLeaveRequestData.createdDate ?? ""),
            DAY_MONTH_YEAR_FORMAT
          )}
        />
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "dateApproved"])}
          durationDate={convertDateToFormat(
            new Date(employeeLeaveRequestData.reviewedDate ?? ""),
            DAY_MONTH_YEAR_FORMAT
          )}
        />
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "recipient"])}
          isRecipient={true}
          styles={{ alignItems: "flex-start" }}
          textStyles={{ mt: "0.75rem" }}
          reviewer={employeeLeaveRequestData.reviewer ?? undefined}
        />

        <StatusPopupColumn
          label={translateText(["myLeaveRequests", "reason"])}
          text={employeeLeaveRequestData.requestDesc}
          isDisabled={true}
        />

        <AttachmentRow attachments={employeeLeaveRequestData?.attachments} />

        <Button variant={"primary"} onClick={() => handleRequestStatusPopup()} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["myLeaveRequests", "proceedToHome"])}</Button>
      </Box>
    </>
  );
};

export default EmployeeLeaveApprovedStatusPopup;
