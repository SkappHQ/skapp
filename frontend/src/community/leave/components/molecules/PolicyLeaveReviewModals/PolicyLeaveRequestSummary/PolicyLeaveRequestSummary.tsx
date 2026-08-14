import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import PolicyLeaveAttachmentRow from "~community/leave/components/molecules/PolicyLeaveAttachmentRow/PolicyLeaveAttachmentRow";
import StatusPopupColumn from "~community/leave/components/molecules/StatusPopupColumn/StatusPopupColumn";
import StatusPopupRow from "~community/leave/components/molecules/StatusPopupRow/StatusPopupRow";
import { SUMMARY_LAYOUTS } from "~community/leave/constants/policyLeaveReviewConstants";
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
  toStatusPopupReviewer
} from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";

interface Props {
  request: PolicyLeaveRequestDetailType;
  popupType: PolicyLeavePopupType;
  handleRequestStatusPopup: () => void;
}

const PolicyLeaveRequestSummary: FC<Props> = ({
  request,
  popupType,
  handleRequestStatusPopup
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );
  const translateMyRequestsText = useTranslator("leaveModule", "myRequests");

  const layout = SUMMARY_LAYOUTS[popupType];

  return (
    <>
      {layout.descriptionKey && (
        <p className="body1 text-zinc-700 mt-4">
          {translateText([layout.descriptionKey])}
        </p>
      )}
      <div
        className={`flex flex-col gap-5 ${layout.containerMarginTopClass ?? ""}`}
      >
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
        {layout.showDateApplied && request.createdDate && (
          <StatusPopupRow
            label={translateText(["dateApplied"])}
            durationDate={formatOptionalDate(request.createdDate)}
          />
        )}
        {layout.showDateApproved && request.reviewedDate && (
          <StatusPopupRow
            label={translateText(["dateApproved"])}
            durationDate={formatOptionalDate(request.reviewedDate)}
          />
        )}
        <StatusPopupRow
          label={translateText(["recipient"])}
          isRecipient={true}
          styles={
            layout.isRecipientTopAligned
              ? { alignItems: "flex-start" }
              : undefined
          }
          textStyles={
            layout.isRecipientTopAligned ? { mt: "0.75rem" } : undefined
          }
          reviewer={toStatusPopupReviewer(request.reviewer)}
        />

        {layout.showReason && (
          <StatusPopupColumn
            label={translateText(["reason"])}
            text={request.requestDesc ?? ""}
            isDisabled={true}
          />
        )}

        {layout.showAttachments && (
          <PolicyLeaveAttachmentRow attachments={request.attachments} />
        )}

        <ButtonV2
          variant={"primary"}
          onClick={handleRequestStatusPopup}
          icon={
            layout.usesArrowRightIcon ? (
              <ArrowRightIcon />
            ) : (
              <Icon name={IconName.RIGHT_ARROW_ICON} />
            )
          }
          iconPosition="end"
        >
          {translateText(["proceedToHome"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default PolicyLeaveRequestSummary;
