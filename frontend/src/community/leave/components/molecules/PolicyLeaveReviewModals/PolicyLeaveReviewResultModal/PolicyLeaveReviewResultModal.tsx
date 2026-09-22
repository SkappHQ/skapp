import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import UndoIcon from "~community/common/assets/Icons/UndoIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import LeaveStatusPopupRow from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupRow/LeaveStatusPopupRow";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
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
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

type PolicyLeaveResultStatus =
  | PolicyLeaveRequestStatus.APPROVED
  | PolicyLeaveRequestStatus.DENIED
  | PolicyLeaveRequestStatus.CANCELLED
  | PolicyLeaveRequestStatus.REVOKED;

const RESULT_STATUS_ICON_NAMES: Record<PolicyLeaveResultStatus, IconName> = {
  [PolicyLeaveRequestStatus.APPROVED]: IconName.APPROVED_STATUS_ICON,
  [PolicyLeaveRequestStatus.DENIED]: IconName.DENIED_STATUS_ICON,
  [PolicyLeaveRequestStatus.CANCELLED]: IconName.CANCELLED_STATUS_ICON,
  [PolicyLeaveRequestStatus.REVOKED]: IconName.REVOKED_STATUS_ICON
};

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
  const translateText = useTranslator("leaveModule");
  const commonTranslateText = useTranslator("words");

  const { setToastMessage } = useToast();
  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate: revokeLeaveRequest, isPending } = useReviewPolicyLeaveRequest(
    () => {
      setPopupType(PolicyLeaveReviewModalEnums.NONE);
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText([
          "leaveRequests",
          "leaveManagerEmployee",
          "revokeLeaveSuccessTitle"
        ]),
        description: translateText([
          "leaveRequests",
          "leaveManagerEmployee",
          "revokeLeaveSuccessDesc"
        ]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_REVOKED);
      closeModal();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText([
          "leaveRequests",
          "leaveManagerEmployee",
          "revokeLeaveFailTitle"
        ]),
        description: translateText([
          "leaveRequests",
          "leaveManagerEmployee",
          "revokeLeaveFailDesc"
        ]),
        isIcon: true
      });
    }
  );

  const handleUndo = (): void => {
    revokeLeaveRequest({
      leaveRequestId: request.leaveRequestId,
      status: PolicyLeaveRequestStatus.REVOKED,
      reviewerComment: ""
    });
  };

  const isApproved =
    popupType === PolicyLeaveRequestStatus.APPROVED ||
    popupType === PolicyLeaveReviewModalEnums.APPROVED_STATUS;

  const isDenied =
    popupType === PolicyLeaveRequestStatus.DENIED ||
    popupType === PolicyLeaveReviewModalEnums.DECLINE_STATUS;

  const resolvedStatus = ((): PolicyLeaveResultStatus => {
    if (isApproved) return PolicyLeaveRequestStatus.APPROVED;
    if (popupType === PolicyLeaveRequestStatus.CANCELLED)
      return PolicyLeaveRequestStatus.CANCELLED;
    if (isDenied) return PolicyLeaveRequestStatus.DENIED;
    return PolicyLeaveRequestStatus.REVOKED;
  })();

  return (
    <div>
      <div className="pt-3 pb-4">
        <LeaveStatusPopupRow
          label={translateText([
            "leaveRequests",
            "leaveManagerEmployee",
            "member"
          ])}
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
          label={translateText([
            "leaveRequests",
            "leaveManagerEmployee",
            "duration"
          ])}
          durationByDays={getPolicyLeaveDurationLabel(
            request.durationDays,
            request.leaveState,
            translateText,
            commonTranslateText(["days"])
          )}
          durationDate={getStartEndDate(request.startDate, request.endDate)}
          styles={{ marginBottom: "1.25rem" }}
        />
        <LeaveStatusPopupRow
          label={translateText([
            "leaveRequests",
            "leaveManagerEmployee",
            "type"
          ])}
          iconType={request.leaveType.name}
          styles={{ marginBottom: "1.25rem" }}
          icon={request.leaveType.emojiCode}
        />
        <LeaveStatusPopupRow
          label={translateText([
            "leaveRequests",
            "leaveManagerEmployee",
            "status"
          ])}
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
            {translateText([
              "leaveRequests",
              "leaveManagerEmployee",
              "revokeLeave"
            ])}
          </ButtonV2>
        )}
        <ButtonV2
          onClick={closeModal}
          icon={<RightArrowIcon />}
          iconPosition="end"
        >
          {translateText([
            "leaveRequests",
            "leaveManagerEmployee",
            "proceedToDashboard"
          ])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyLeaveReviewResultModal;
