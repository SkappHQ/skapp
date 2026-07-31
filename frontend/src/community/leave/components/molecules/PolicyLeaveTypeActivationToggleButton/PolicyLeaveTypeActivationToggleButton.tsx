import { Stack } from "@mui/material";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useChangePolicyLeaveTypeStatus,
  useGetPolicyLeaveType
} from "~community/leave/api/PolicyLeaveTypeApi";
import { getPolicyLeaveTypeErrorToastKeys } from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";

import styles from "./styles";

const PolicyLeaveTypeActivationToggleButton = () => {
  const classes = styles();

  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();
  const { id } = router.query;

  const policyLeaveTypeId = id ? Number(id) : undefined;

  const { setToastMessage } = useToast();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: policyLeaveType } = useGetPolicyLeaveType(policyLeaveTypeId);

  const isActive = policyLeaveType?.isActive ?? true;

  const { mutate: changeStatus, isPending } = useChangePolicyLeaveTypeStatus(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["editLeaveTypeSuccessToastTitle"]),
        description: translateText(["editLeaveTypeSuccessToastDescription"]),
        isIcon: true
      });
      setIsConfirmModalOpen(false);
    },
    (error: AxiosError) => {
      const { title, description } = getPolicyLeaveTypeErrorToastKeys(error);

      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText([title]),
        description: translateText([description]),
        isIcon: true
      });
      setIsConfirmModalOpen(false);
    }
  );

  const handleConfirm = () => {
    if (isPending || !policyLeaveTypeId) {
      return;
    }

    changeStatus({ id: policyLeaveTypeId, isActive: !isActive });
  };

  return (
    <>
      <Stack sx={classes.wrapper}>
        <SwitchRow
          labelId="activate"
          label={translateText(["activate"])}
          checked={isActive}
          disabled={!policyLeaveType || isPending}
          onChange={() => setIsConfirmModalOpen(true)}
        />
        <Tooltip
          id="activate-leave-tooltip"
          title={`${translateText(["activateLeaveTooltipText"])}`}
        />
      </Stack>
      <Modal
        isModalOpen={isConfirmModalOpen}
        onCloseModal={() => setIsConfirmModalOpen(false)}
        title={
          isActive
            ? translateText(["inactivateLeaveTypeModalTitle"])
            : translateText(["activateLeaveTypeModalTitle"])
        }
        isClosable={false}
        isDividerVisible
        ids={{
          title: "user-prompt-modal-title",
          description: "user-prompt-modal-description",
          closeButton: "user-prompt-modal-close-button"
        }}
      >
        <UserPromptModal
          description={
            isActive
              ? translateText(["inactivatePolicyLeaveTypeModalDescription"])
              : translateText(["activatePolicyLeaveTypeModalDescription"])
          }
          primaryBtn={{
            label: translateText(["confirmAndSaveBtn"]),
            onClick: handleConfirm,
            isDisabled: isPending
          }}
          secondaryBtn={{
            label: translateText(["cancelBtn"]),
            onClick: () => setIsConfirmModalOpen(false)
          }}
        />
      </Modal>
    </>
  );
};

export default PolicyLeaveTypeActivationToggleButton;
