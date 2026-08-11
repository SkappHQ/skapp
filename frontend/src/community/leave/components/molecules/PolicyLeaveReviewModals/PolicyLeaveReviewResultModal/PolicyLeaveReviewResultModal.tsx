import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { Dispatch, FC, SetStateAction } from "react";

import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import UndoIcon from "~community/common/assets/Icons/UndoIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { getAsDaysString } from "~community/common/utils/dateTimeUtils";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import LeaveStatusPopupRow from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupRow/LeaveStatusPopupRow";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { getStartEndDate } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  closeModel: () => void;
  popupType: string;
  setPopupType: Dispatch<SetStateAction<string>>;
}

const PolicyLeaveReviewResultModal: FC<Props> = ({
  request,
  closeModel,
  popupType,
  setPopupType
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const { setToastMessage } = useToast();
  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate } = useReviewPolicyLeaveRequest(
    () => {
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
    },
    () => {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["revokeLeaveFailTitle"]),
        description: translateText(["revokeLeaveFailDesc"]),
        isIcon: true
      });
    }
  );

  const handelUndo = (): void => {
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
          durationByDays={getAsDaysString(request.durationDays)}
          durationDate={getStartEndDate(request.startDate, request.endDate)}
          styles={{ marginBottom: "1.25rem" }}
        />
        <LeaveStatusPopupRow
          label={translateText(["type"])}
          iconType={request.leaveType.name}
          styles={{ marginBottom: "1.25rem" }}
          aria-label={`Leave request type is ${request.leaveType.name}`}
          icon={request.leaveType.emojiCode}
        />
        <LeaveStatusPopupRow
          label={translateText(["status"])}
          styles={{ marginBottom: "1.25rem" }}
          iconType={
            isApproved
              ? PolicyLeaveRequestStatus.APPROVED
              : popupType === PolicyLeaveRequestStatus.CANCELLED
                ? PolicyLeaveRequestStatus.CANCELLED
                : isDenied
                  ? PolicyLeaveRequestStatus.DENIED
                  : PolicyLeaveRequestStatus.REVOKED
          }
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
            onClick={handelUndo}
            icon={<UndoIcon />}
            iconPosition="start"
          >
            {translateText(["revokeLeave"])}
          </ButtonV2>
        )}
        <ButtonV2
          onClick={closeModel}
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
