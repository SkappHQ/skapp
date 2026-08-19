import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useReviewPolicyLeaveRequest } from "~community/leave/api/PolicyLeaveReviewApi";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeavePopupType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyCancelLeaveModal: FC<Props> = ({ request, setPopupType }) => {
  const theme: Theme = useTheme();
  const { setToastMessage } = useToast();
  const translateText = useTranslator("leaveModule", "myRequests");

  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate: cancelLeaveRequest, isPending } = useReviewPolicyLeaveRequest(
    () => {
      setPopupType(PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY);
      setToastMessage({
        open: true,
        title: translateText(["myLeaveRequests", "leaveCancelSuccessTitle"]),
        description: translateText([
          "myLeaveRequests",
          "leaveCancelSuccessDescription"
        ]),
        toastType: ToastType.SUCCESS
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_CANCELLED);
    },
    () => {
      setToastMessage({
        open: true,
        title: translateText(["myLeaveRequests", "leaveCancelErrorTitle"]),
        description: translateText([
          "myLeaveRequests",
          "leaveCancelErrorDescription"
        ]),
        toastType: ToastType.ERROR
      });
    }
  );

  const handleCancelLeave = (): void => {
    cancelLeaveRequest({
      leaveRequestId: request.leaveRequestId,
      status: PolicyLeaveRequestStatus.CANCELLED
    });
  };

  return (
    <>
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.grey[400],
          marginTop: "1rem"
        }}
        tabIndex={0}
      >
        {translateText(["myLeaveRequests", "confirmCancelDescription"])}
      </Typography>

      <Box
        sx={{
          marginTop: "1.25rem"
        }}
      >
        <ButtonV2
          variant={"error"}
          onClick={handleCancelLeave}
          isLoading={isPending}
          icon={<Icon name={IconName.REQUEST_CANCEL_CROSS_ICON} />}
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "confirmAndCancelRequestBtn"])}
        </ButtonV2>
      </Box>
    </>
  );
};

export default PolicyCancelLeaveModal;
