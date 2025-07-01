import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { JSX, useEffect } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useLeaveCarryForward } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import styles from "./styles";

interface Props {
  handleClose: () => void;
}

const LeaveCarryForwardSyncConfirmation = ({
  handleClose
}: Props): JSX.Element => {
  const classes = styles();

  const { setToastMessage } = useToast();

  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");

  const { leaveCarryForwardId, setLeaveCarryForwardSyncBtnStatus } =
    useLeaveStore((state) => ({
      leaveCarryForwardId: state.leaveCarryForwardId,
      setLeaveCarryForwardSyncBtnStatus: state.setLeaveCarryForwardSyncBtnStatus
    }));

  const { sendEvent } = useGoogleAnalyticsEvent();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateTexts(["leaveCarryForwardSuccessToastTitle"]),
      description: translateTexts(["leaveCarryForwardSuccessToastDescription"]),
      isIcon: true
    });
    setLeaveCarryForwardSyncBtnStatus("isLoading", false);
    setLeaveCarryForwardSyncBtnStatus("isDisabled", true);
    sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_CARRIED_FORWARD);
    handleClose();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateTexts(["leaveCarryForwardFailToastTitle"]),
      description: translateTexts(["leaveCarryForwardFailToastDescription"]),
      isIcon: true
    });
    setLeaveCarryForwardSyncBtnStatus("isLoading", false);
  };

  const { mutate, isPending } = useLeaveCarryForward(onSuccess, onError);

  useEffect(() => {
    setLeaveCarryForwardSyncBtnStatus("isLoading", isPending);
  }, [isPending, setLeaveCarryForwardSyncBtnStatus]);

  return (
    <Stack sx={classes.wrapper}>
      <Typography
        sx={classes.title}
        variant="body1"
        id="leave-carry-forward-confirm-synchronization-modal-description"
      >
        {translateTexts(["leaveCarryForwardModalDescription"]) ?? ""}
      </Typography>
      <Box>
        <Button
          accessibility={{
            ariaHidden: true
          }}
          label={translateTexts(["leaveCarryForwardModalConfirmSyncBtn"])}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          type={ButtonTypes.SUBMIT}
          onClick={() => mutate(leaveCarryForwardId)}
        />
        <Button
          accessibility={{
            ariaHidden: true
          }}
          buttonStyle={ButtonStyle.TERTIARY}
          styles={{ mt: "1rem" }}
          type={ButtonTypes.BUTTON}
          label={translateTexts(["leaveCarryForwardModalCancelBtn"])}
          endIcon={<Icon name={IconName.CLOSE_ICON} />}
          onClick={handleClose}
        />
      </Box>
    </Stack>
  );
};

export default LeaveCarryForwardSyncConfirmation;
