import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
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
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyCancelLeaveModal: FC<Props> = ({ request, setPopupType }) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );

  const { reviewRequest: cancelRequest, isPending } =
    usePolicyLeaveReviewAction({
      status: PolicyLeaveRequestStatus.CANCELLED,
      successToast: PolicyLeaveReviewToastEnums.CANCEL_SUCCESS,
      errorToast: PolicyLeaveReviewToastEnums.CANCEL_ERROR,
      analyticsEvent: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_CANCELLED,
      onSuccess: () =>
        setPopupType(PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY)
    });

  const handleCancelLeave = (): void => {
    cancelRequest(request.leaveRequestId);
  };

  return (
    <>
      <p className="body1 text-zinc-700 mt-4" tabIndex={0}>
        {translateText(["confirmCancelDescription"])}
      </p>
      <div className="mt-5">
        <ButtonV2
          variant={"error"}
          onClick={handleCancelLeave}
          isLoading={isPending}
          icon={<Icon name={IconName.REQUEST_CANCEL_CROSS_ICON} />}
          iconPosition="end"
        >
          {translateText(["confirmAndCancelRequestBtn"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default PolicyCancelLeaveModal;
