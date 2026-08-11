import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { Dispatch, FC, SetStateAction, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import LeaveStatusPopupColumn from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupColumn/LeaveStatusPopupColumn";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeaveRequestDetailType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { validateDescription } from "~community/leave/utils/LeavePreprocessors";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  closeModel: () => void;
  setPopupType: Dispatch<SetStateAction<string>>;
}

const PolicyLeaveDeclineModal: FC<Props> = ({
  request,
  closeModel,
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

  const { mutate } = useReviewPolicyLeaveRequest(
    () => {
      setToastMessage({
        open: true,
        toastType: "success",
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
        toastType: "error",
        title: translateText(["declineLeaveFailTitle"]),
        description: translateText(["declineLeaveFailDesc"]),
        isIcon: true
      });
    }
  );

  const handelDecline = (): void => {
    if (validateDescription(reason)) setError(true);
    else {
      setError(false);
      mutate({
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
          onClick={closeModel}
          icon={<CloseIcon />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          onClick={handelDecline}
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
