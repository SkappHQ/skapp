import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useCheckPolicyLeaveAlreadyNudged,
  useNudgePolicyLeaveRequestManagers
} from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyLeaveAttachmentRow from "~community/leave/components/molecules/PolicyLeaveAttachmentRow/PolicyLeaveAttachmentRow";
import StatusPopupColumn from "~community/leave/components/molecules/StatusPopupColumn/StatusPopupColumn";
import StatusPopupRow from "~community/leave/components/molecules/StatusPopupRow/StatusPopupRow";
import {
  PolicyLeaveReviewModalEnums,
  PolicyLeaveReviewToastEnums
} from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeavePopupType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import {
  getStartEndDate,
  handleDurationDay,
  handleLeaveStatus,
  leaveStatusIconSelector
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import {
  formatOptionalDate,
  handlePolicyLeaveReviewToast,
  toStatusPopupReviewer
} from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";

interface Props {
  request: PolicyLeaveRequestDetailType;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyEmployeeRequestModal: FC<Props> = ({ request, setPopupType }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateLeaveModuleText = useTranslator("leaveModule");
  const translateMyRequestsText = useTranslator("leaveModule", "myRequests");

  const { setToastMessage } = useToast();

  const { data: nudgeLog } = useCheckPolicyLeaveAlreadyNudged(
    request.leaveRequestId
  );

  const { mutate: nudgeManager } = useNudgePolicyLeaveRequestManagers(
    () => {
      setPopupType(PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED);
      handlePolicyLeaveReviewToast({
        type: PolicyLeaveReviewToastEnums.NUDGE_SUCCESS,
        setToastMessage,
        translateLeaveModuleText
      });
    },
    () => {
      handlePolicyLeaveReviewToast({
        type: PolicyLeaveReviewToastEnums.NUDGE_ERROR,
        setToastMessage,
        translateLeaveModuleText
      });
    }
  );

  const handleNudgeButton = (): void => {
    nudgeManager(request.leaveRequestId);
  };

  const handleCancelButton = (): void => {
    setPopupType(PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP);
  };

  return (
    <div className="flex flex-col gap-5 mt-4 mb-1.5">
      <StatusPopupRow
        label={translateText(["type"])}
        iconName={request.leaveType.name}
        icon={request.leaveType.emojiCode}
      />
      <StatusPopupRow
        label={translateText(["status"])}
        iconName={handleLeaveStatus(request.status)}
        icon={leaveStatusIconSelector(request.status)}
      />
      <StatusPopupRow
        label={translateText(["duration"])}
        durationByDays={handleDurationDay(
          request.durationDays,
          request.leaveState,
          translateMyRequestsText
        )}
        durationDate={getStartEndDate(request.startDate, request.endDate)}
      />
      <StatusPopupRow
        label={translateText(["dateApplied"])}
        durationDate={formatOptionalDate(request.createdDate)}
      />
      <StatusPopupRow
        label={translateText(["recipient"])}
        isRecipient={true}
        styles={{ alignItems: "flex-start" }}
        textStyles={{ mt: "0.75rem" }}
        reviewer={toStatusPopupReviewer(request.reviewer)}
      />

      <StatusPopupColumn
        label={translateText(["reason"])}
        text={request.requestDesc ?? ""}
        isDisabled={true}
      />
      <PolicyLeaveAttachmentRow attachments={request.attachments} />
      <div className="flex flex-col gap-4">
        <ButtonV2
          variant={"secondary"}
          onClick={handleNudgeButton}
          disabled={nudgeLog?.isNudge === false}
          icon={<Icon name={IconName.NUDGE_BELL_ICON} />}
          iconPosition="end"
        >
          {translateText(["nudgeSupervisorBtn"])}
        </ButtonV2>

        <ButtonV2
          variant={"error"}
          onClick={handleCancelButton}
          icon={<Icon name={IconName.REQUEST_CANCEL_CROSS_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelLeaveRequestBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyEmployeeRequestModal;
