import { Box } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { Dispatch, FC, SetStateAction } from "react";

import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import {
  useCheckPolicyLeaveAlreadyNudged,
  useNudgePolicyLeaveRequestManagers
} from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyLeaveAttachmentRow from "~community/leave/components/molecules/PolicyLeaveAttachmentRow/PolicyLeaveAttachmentRow";
import StatusPopupColumn from "~community/leave/components/molecules/StatusPopupColumn/StatusPopupColumn";
import StatusPopupRow from "~community/leave/components/molecules/StatusPopupRow/StatusPopupRow";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import {
  getStartEndDate,
  handleDurationDay,
  handleLeaveStatus,
  leaveStatusIconSelector
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { toStatusPopupReviewer } from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";

interface Props {
  request: PolicyLeaveRequestDetailType;
  setPopupType: Dispatch<SetStateAction<string>>;
}

const PolicyEmployeeRequestModal: FC<Props> = ({ request, setPopupType }) => {
  const translateText = useTranslator("leaveModule", "myRequests");
  const { setToastMessage } = useToast();

  const { data: nudgeLog } = useCheckPolicyLeaveAlreadyNudged(
    request.leaveRequestId
  );

  const { mutate: nudgeManager } = useNudgePolicyLeaveRequestManagers(
    () => {
      setPopupType(PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED);
      setToastMessage({
        open: true,
        title: translateText(["myLeaveRequests", "nudgeSuccessTitle"]),
        description: translateText([
          "myLeaveRequests",
          "nudgeSuccessDescription"
        ]),
        toastType: ToastType.SUCCESS
      });
    },
    () => {
      setToastMessage({
        open: true,
        title: translateText(["myLeaveRequests", "nudgeErrorTitle"]),
        description: translateText([
          "myLeaveRequests",
          "nudgeErrorDescription"
        ]),
        toastType: ToastType.ERROR
      });
    }
  );

  const handleNudgeButton = (leaveRequestId: number): void => {
    nudgeManager(leaveRequestId);
  };

  const handleCancelButton = (): void => {
    setPopupType(PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "0.375rem",
        marginTop: "1rem",
        gap: "1.25rem"
      }}
    >
      <StatusPopupRow
        label={translateText(["myLeaveRequests", "type"])}
        iconName={request.leaveType.name}
        icon={request.leaveType.emojiCode}
      />
      <StatusPopupRow
        label={translateText(["myLeaveRequests", "status"])}
        iconName={handleLeaveStatus(request.status)}
        icon={leaveStatusIconSelector(request.status)}
      />
      <StatusPopupRow
        label={translateText(["myLeaveRequests", "duration"])}
        durationByDays={handleDurationDay(
          request.durationDays,
          request.leaveState,
          translateText
        )}
        durationDate={getStartEndDate(request.startDate, request.endDate)}
      />
      <StatusPopupRow
        label={translateText(["myLeaveRequests", "dateApplied"])}
        durationDate={convertDateToFormat(
          new Date(request.createdDate ?? ""),
          DAY_MONTH_YEAR_FORMAT
        )}
      />
      <StatusPopupRow
        label={translateText(["myLeaveRequests", "recipient"])}
        isRecipient={true}
        styles={{ alignItems: "flex-start" }}
        textStyles={{ mt: "0.75rem" }}
        reviewer={toStatusPopupReviewer(request.reviewer)}
      />

      <StatusPopupColumn
        label={translateText(["myLeaveRequests", "reason"])}
        text={request.requestDesc ?? ""}
        isDisabled={true}
      />
      <PolicyLeaveAttachmentRow attachments={request.attachments} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <ButtonV2
          variant={"secondary"}
          onClick={() => handleNudgeButton(request.leaveRequestId)}
          disabled={nudgeLog?.isNudge === false}
          icon={<Icon name={IconName.NUDGE_BELL_ICON} />}
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "nudgeSupervisorBtn"])}
        </ButtonV2>

        <ButtonV2
          variant={"error"}
          onClick={handleCancelButton}
          icon={<Icon name={IconName.REQUEST_CANCEL_CROSS_ICON} />}
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "cancelLeaveRequestBtn"])}
        </ButtonV2>
      </Box>
    </Box>
  );
};

export default PolicyEmployeeRequestModal;
