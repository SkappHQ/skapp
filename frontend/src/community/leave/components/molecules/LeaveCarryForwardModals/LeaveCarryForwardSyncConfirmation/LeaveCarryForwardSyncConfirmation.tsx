import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, useEffect } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useLeaveCarryForward } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  handleClose: () => void;
}

const LeaveCarryForwardSyncConfirmation = ({
  handleClose
}: Props): JSX.Element => {
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
    <div className="min-w-[31.25rem]">
      <p
        className="mb-4 text-gray-900 w-full"
        id="leave-carry-forward-confirm-synchronization-modal-description"
      >
        {translateTexts(["leaveCarryForwardModalDescription"]) ?? ""}
      </p>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          type={"button"}
          onClick={handleClose}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardModalCancelBtn"])}
        </ButtonV2>
        <ButtonV2
          type={"submit"}
          onClick={() => mutate(leaveCarryForwardId)}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardModalConfirmSyncBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LeaveCarryForwardSyncConfirmation;
