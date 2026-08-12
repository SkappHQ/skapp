import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import PolicyLeaveAttachmentRow from "~community/leave/components/molecules/PolicyLeaveAttachmentRow/PolicyLeaveAttachmentRow";
import StatusPopupColumn from "~community/leave/components/molecules/StatusPopupColumn/StatusPopupColumn";
import StatusPopupRow from "~community/leave/components/molecules/StatusPopupRow/StatusPopupRow";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
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
  popupType: string;
  handleRequestStatusPopup: () => void;
}

interface SummaryLayout {
  descriptionKey?: string;
  containerMarginTop?: string;
  showDateApplied: boolean;
  showDateApproved: boolean;
  showReason: boolean;
  showAttachments: boolean;
  isRecipientTopAligned: boolean;
  usesArrowRightIcon: boolean;
}

/**
 * One entry per legacy popup this summary replaces (`EmployeeLeave*StatusPopup`,
 * `EmployeeLeaveRequestCancelledPopup`, `EmployeeNudgeSupervisorPopup`). Each reproduces
 * the row set and spacing of its legacy counterpart, which differ per status.
 */
const SUMMARY_LAYOUTS: Record<string, SummaryLayout> = {
  [PolicyLeaveRequestStatus.APPROVED]: {
    containerMarginTop: "1.25rem",
    showDateApplied: true,
    showDateApproved: true,
    showReason: true,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveRequestStatus.DENIED]: {
    containerMarginTop: "1rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: false,
    isRecipientTopAligned: false,
    usesArrowRightIcon: true
  },
  [PolicyLeaveRequestStatus.REVOKED]: {
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: false,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveRequestStatus.CANCELLED]: {
    containerMarginTop: "1rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: false,
    usesArrowRightIcon: true
  },
  [PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY]: {
    descriptionKey: "leaveRequestCancelledDescription",
    containerMarginTop: "1.25rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED]: {
    descriptionKey: "supervisorNudgedDescription",
    containerMarginTop: "1.25rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  }
};

const PolicyLeaveRequestSummary: FC<Props> = ({
  request,
  popupType,
  handleRequestStatusPopup
}) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("leaveModule", "myRequests");

  const layout =
    SUMMARY_LAYOUTS[popupType] ??
    SUMMARY_LAYOUTS[PolicyLeaveRequestStatus.REVOKED];

  return (
    <>
      {layout.descriptionKey && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.grey[400],
            marginTop: "1rem"
          }}
          tabIndex={0}
        >
          {translateText(["myLeaveRequests", layout.descriptionKey])}
        </Typography>
      )}
      <Box
        sx={{
          marginTop: layout.containerMarginTop,
          display: "flex",
          flexDirection: "column",
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
        {layout.showDateApplied && request.createdDate && (
          <StatusPopupRow
            label={translateText(["myLeaveRequests", "dateApplied"])}
            durationDate={formatOptionalDate(request.createdDate)}
          />
        )}
        {layout.showDateApproved && request.reviewedDate && (
          <StatusPopupRow
            label={translateText(["myLeaveRequests", "dateApproved"])}
            durationDate={formatOptionalDate(request.reviewedDate)}
          />
        )}
        <StatusPopupRow
          label={translateText(["myLeaveRequests", "recipient"])}
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
            label={translateText(["myLeaveRequests", "reason"])}
            text={request.requestDesc ?? ""}
            isDisabled={true}
          />
        )}

        {layout.showAttachments && (
          <PolicyLeaveAttachmentRow attachments={request.attachments} />
        )}

        <ButtonV2
          variant={"primary"}
          onClick={() => handleRequestStatusPopup()}
          icon={
            layout.usesArrowRightIcon ? (
              <ArrowRightIcon />
            ) : (
              <Icon name={IconName.RIGHT_ARROW_ICON} />
            )
          }
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "proceedToHome"])}
        </ButtonV2>
      </Box>
    </>
  );
};

export default PolicyLeaveRequestSummary;
