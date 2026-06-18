import { Box, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useCancelLeaveRequest } from "~community/leave/api/MyRequestApi";
import { useLeaveStore } from "~community/leave/store/store";
import { EmployeeLeaveStatusPopupTypes } from "~community/leave/types/EmployeeLeaveRequestTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  setPopupType: (type: EmployeeLeaveStatusPopupTypes) => void;
}

const EmployeeConfirmCancelLeavePopup: FC<Props> = ({ setPopupType }) => {
  const theme: Theme = useTheme();
  const { employeeLeaveRequestData, selectedYear } = useLeaveStore(
    (state) => state
  );
  const { setToastMessage } = useToast();
  const translateText = useTranslator("leaveModule", "myRequests");
  const {
    mutate: employeeCancelLeaveRequest,
    isSuccess: isCancellationSuccess,
    isError: isCancellationError,
    isPending: isCancellationPending
  } = useCancelLeaveRequest(selectedYear);

  const { sendEvent } = useGoogleAnalyticsEvent();

  useEffect(() => {
    if (isCancellationSuccess) {
      setPopupType(EmployeeLeaveStatusPopupTypes.CANCELLED_SUMMARY);
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
    }
    if (isCancellationError) {
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
  }, [isCancellationSuccess, isCancellationError]);

  const handleCancelLeave = (): void => {
    const data = { id: employeeLeaveRequestData?.leaveRequestId };
    employeeCancelLeaveRequest(data);
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
          isLoading={isCancellationPending}
          icon={<Icon name={IconName.REQUEST_CANCEL_CROSS_ICON} />}
          iconPosition="end"
        >
          {translateText(["myLeaveRequests", "confirmAndCancelRequestBtn"])}
        </ButtonV2>
      </Box>
    </>
  );
};

export default EmployeeConfirmCancelLeavePopup;
