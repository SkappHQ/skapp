import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import UndoIcon from "~community/common/assets/Icons/UndoIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveStatusPopupRow from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupRow/LeaveStatusPopupRow";
import { RESULT_STATUS_ICON_NAMES } from "~community/leave/constants/policyLeaveReviewConstants";
import {
  PolicyLeaveReviewModalEnums,
  PolicyLeaveReviewToastEnums
} from "~community/leave/enums/PolicyLeaveReviewEnums";
import usePolicyLeaveReviewAction from "~community/leave/hooks/usePolicyLeaveReviewAction";
import {
  PolicyLeavePopupType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import {
  getStartEndDate,
  handleLeaveStatus
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyLeaveDurationLabel } from "~community/leave/utils/policyLeave/policyLeaveDurationUtils";
import {
  getPolicyLeaveResultStatus,
  isApprovedPopupType
} from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  closeModal: () => void;
  popupType: PolicyLeavePopupType;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyLeaveReviewResultModal: FC<Props> = ({
  request,
  closeModal,
  popupType,
  setPopupType
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const translateLeaveModuleText = useTranslator("leaveModule");
  const commonTranslateText = useTranslator("words");

  const { reviewRequest: revokeRequest, isPending } =
    usePolicyLeaveReviewAction({
      status: PolicyLeaveRequestStatus.REVOKED,
      successToast: PolicyLeaveReviewToastEnums.REVOKE_SUCCESS,
      errorToast: PolicyLeaveReviewToastEnums.REVOKE_ERROR,
      analyticsEvent: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_REVOKED,
      onSuccess: () => {
        setPopupType(PolicyLeaveReviewModalEnums.NONE);
        closeModal();
      }
    });

  const handleUndo = (): void => {
    revokeRequest(request.leaveRequestId, "");
  };

  const isApproved = isApprovedPopupType(popupType);
  const resolvedStatus = getPolicyLeaveResultStatus(popupType);

  return (
    <div>
      <div className="pt-3 pb-4">
        <LeaveStatusPopupRow
          label={translateText(["member"])}
          isRecipient={true}
          styles={{ marginBottom: "1.25rem" }}
          role="member"
          employee={{
            empName: request.employee.firstName,
            lastName: request.employee.lastName,
            avatarUrl: request.employee.authPic ?? ""
          }}
          profilePicture={request.employee.authPic ?? ""}
        />
        <LeaveStatusPopupRow
          label={translateText(["duration"])}
          durationByDays={getPolicyLeaveDurationLabel(
            request.durationDays,
            request.leaveState,
            translateLeaveModuleText,
            commonTranslateText(["days"])
          )}
          durationDate={getStartEndDate(request.startDate, request.endDate)}
          styles={{ marginBottom: "1.25rem" }}
        />
        <LeaveStatusPopupRow
          label={translateText(["type"])}
          iconType={request.leaveType.name}
          styles={{ marginBottom: "1.25rem" }}
          icon={request.leaveType.emojiCode}
        />
        <LeaveStatusPopupRow
          label={translateText(["status"])}
          styles={{ marginBottom: "1.25rem" }}
          iconType={handleLeaveStatus(resolvedStatus)}
          icon={<Icon name={RESULT_STATUS_ICON_NAMES[resolvedStatus]} />}
        />
      </div>
      <div className="flex flex-row gap-4 justify-end">
        {isApproved && (
          <ButtonV2
            variant={"tertiary"}
            onClick={handleUndo}
            isLoading={isPending}
            icon={<UndoIcon />}
            iconPosition="start"
          >
            {translateText(["revokeLeave"])}
          </ButtonV2>
        )}
        <ButtonV2
          onClick={closeModal}
          icon={<RightArrowIcon />}
          iconPosition="end"
        >
          {translateText(["proceedToDashboard"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyLeaveReviewResultModal;
