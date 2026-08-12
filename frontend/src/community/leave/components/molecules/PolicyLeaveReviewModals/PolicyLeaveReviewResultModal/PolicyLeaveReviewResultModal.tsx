import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { Dispatch, FC, SetStateAction } from "react";

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
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import {
  getStartEndDate,
  handleLeaveStatus
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyLeaveDurationLabel } from "~community/leave/utils/policyLeave/policyLeaveDurationUtils";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  closeModal: () => void;
  popupType: string;
  setPopupType: Dispatch<SetStateAction<string>>;
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
  const translateDurationText = useTranslator("leaveModule", "myRequests");
  const commonTranslateText = useTranslator("words");

  const { setToastMessage } = useToast();
  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate, isPending } = useReviewPolicyLeaveRequest(
    () => {
      setPopupType("");
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["revokeLeaveSuccessTitle"]),
        description: translateText(["revokeLeaveSuccessDesc"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_REVOKED);
      closeModal();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["revokeLeaveFailTitle"]),
        description: translateText(["revokeLeaveFailDesc"]),
        isIcon: true
      });
    }
  );

  const handleUndo = (): void => {
    mutate({
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

  const resolvedStatus = ((): PolicyLeaveRequestStatus => {
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
            translateDurationText,
            commonTranslateText
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
          icon={
            isApproved ? (
              <Icon name={IconName.APPROVED_STATUS_ICON} />
            ) : isDenied ? (
              <Icon name={IconName.DENIED_STATUS_ICON} />
            ) : popupType === PolicyLeaveRequestStatus.REVOKED ? (
              <Icon name={IconName.REVOKED_STATUS_ICON} />
            ) : (
              <Icon name={IconName.CANCELLED_STATUS_ICON} />
            )
          }
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
