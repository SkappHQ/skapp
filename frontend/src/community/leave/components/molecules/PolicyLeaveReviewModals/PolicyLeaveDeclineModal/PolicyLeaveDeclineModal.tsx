import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import LeaveStatusPopupColumn from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupColumn/LeaveStatusPopupColumn";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeavePopupType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { validateDescription } from "~community/leave/utils/LeavePreprocessors";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  closeModal: () => void;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyLeaveDeclineModal: FC<Props> = ({
  request,
  closeModal,
  setPopupType
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const { setToastMessage } = useToast();

  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate: declineLeaveRequest, isPending } =
    useReviewPolicyLeaveRequest(
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["declineLeaveSuccessTitle"]),
          description: translateText(["declineLeaveSuccessDesc"]),
          isIcon: true
        });
        sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_DECLINED);
        setPopupType(PolicyLeaveReviewModalEnums.DECLINE_STATUS);
      },
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["declineLeaveFailTitle"]),
          description: translateText(["declineLeaveFailDesc"]),
          isIcon: true
        });
      }
    );

  const handleDecline = (): void => {
    if (validateDescription(reason)) setError(true);
    else {
      setError(false);
      declineLeaveRequest({
        leaveRequestId: request.leaveRequestId,
        status: PolicyLeaveRequestStatus.DENIED,
        reviewerComment: reason
      });
    }
  };

  return (
    <div aria-modal={true}>
      <div className="pb-4">
        <LeaveStatusPopupColumn
          id="reason"
          label={translateText(["reasonToDecline"])}
          text={reason}
          setInputText={setReason}
          error={error}
          errorMessage={translateText(["EnterWhyDecline"])}
          required
        />
      </div>
      <div className="flex flex-row gap-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={closeModal}
          icon={<CloseIcon />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          onClick={handleDecline}
          isLoading={isPending}
          icon={<CloseIcon fill="var(--color-primary-text)" />}
          iconPosition="end"
        >
          {translateText(["declineLeave"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyLeaveDeclineModal;
