import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import { PolicyLeaveReviewToastEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { handlePolicyLeaveReviewToast } from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  status: PolicyLeaveRequestStatus;
  successToast: PolicyLeaveReviewToastEnums;
  errorToast: PolicyLeaveReviewToastEnums;
  analyticsEvent: GoogleAnalyticsTypes;
  onSuccess: () => void;
}

interface PolicyLeaveReviewAction {
  reviewRequest: (leaveRequestId: number, reviewerComment?: string) => void;
  isPending: boolean;
}

const usePolicyLeaveReviewAction = ({
  status,
  successToast,
  errorToast,
  analyticsEvent,
  onSuccess
}: Props): PolicyLeaveReviewAction => {
  const translateText = useTranslator("leaveModule");

  const { setToastMessage } = useToast();
  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate, isPending } = useReviewPolicyLeaveRequest(
    () => {
      onSuccess();
      handlePolicyLeaveReviewToast({
        type: successToast,
        setToastMessage,
        translateText
      });
      sendEvent(analyticsEvent);
    },
    () => {
      handlePolicyLeaveReviewToast({
        type: errorToast,
        setToastMessage,
        translateText
      });
    }
  );

  const reviewRequest = (
    leaveRequestId: number,
    reviewerComment?: string
  ): void => {
    mutate({
      leaveRequestId,
      status,
      ...(reviewerComment === undefined ? {} : { reviewerComment })
    });
  };

  return { reviewRequest, isPending };
};

export default usePolicyLeaveReviewAction;
