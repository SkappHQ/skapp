import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveStatusPopupColumn from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupColumn/LeaveStatusPopupColumn";
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
import { validateDescription } from "~community/leave/utils/LeavePreprocessors";
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

  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const { reviewRequest: declineRequest, isPending } =
    usePolicyLeaveReviewAction({
      status: PolicyLeaveRequestStatus.DENIED,
      successToast: PolicyLeaveReviewToastEnums.DECLINE_SUCCESS,
      errorToast: PolicyLeaveReviewToastEnums.DECLINE_ERROR,
      analyticsEvent: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_DECLINED,
      onSuccess: () => setPopupType(PolicyLeaveReviewModalEnums.DECLINE_STATUS)
    });

  const handleDecline = (): void => {
    if (validateDescription(reason)) {
      setError(true);
      return;
    }

    setError(false);
    declineRequest(request.leaveRequestId, reason);
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
