import {
  CloseIcon,
  InfoIcon,
  SmallModal,
  TickIcon,
  Toggle,
  Tooltip
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { FC, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useActivatePolicyLeaveType,
  useDeactivatePolicyLeaveType,
  useGetPolicyLeaveType
} from "~community/leave/api/PolicyLeaveTypeApi";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { getPolicyLeaveTypeErrorToastKeys } from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";

const PolicyLeaveTypeActivationToggleButton: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();
  const { id } = router.query;

  const policyLeaveTypeId = Number(id);

  const canManageLeavePolicies = useCanManageLeavePolicies();

  const { setToastMessage } = useToast();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: policyLeaveType, isLoading } =
    useGetPolicyLeaveType(policyLeaveTypeId);

  const onStatusChangeSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["editLeaveTypeSuccessToastTitle"]),
      description: translateText(["editLeaveTypeSuccessToastDescription"]),
      isIcon: true
    });
    setIsConfirmModalOpen(false);
  };

  const onStatusChangeError = (error: AxiosError): void => {
    const { title, description } = getPolicyLeaveTypeErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description]),
      isIcon: true
    });
    setIsConfirmModalOpen(false);
  };

  const { mutate: activatePolicyLeaveType, isPending: isActivating } =
    useActivatePolicyLeaveType(onStatusChangeSuccess, onStatusChangeError);

  const { mutate: deactivatePolicyLeaveType, isPending: isDeactivating } =
    useDeactivatePolicyLeaveType(onStatusChangeSuccess, onStatusChangeError);

  const isPending = isActivating || isDeactivating;

  const handleOpenConfirmModal = (): void => {
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = (): void => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirm = (): void => {
    if (isPending || !policyLeaveTypeId) {
      return;
    }

    if (policyLeaveType?.isActive) {
      deactivatePolicyLeaveType(policyLeaveTypeId);
      return;
    }

    activatePolicyLeaveType(policyLeaveTypeId);
  };

  if (!canManageLeavePolicies) {
    return null;
  }

  return (
    <>
      <div className="flex w-full flex-row items-center justify-end gap-2.5">
        <p className="body1 text-secondary-text">
          {translateText(["activate"])}
        </p>
        <Toggle
          checked={policyLeaveType?.isActive as boolean}
          disabled={!policyLeaveType || isPending || isLoading}
          onChange={handleOpenConfirmModal}
          ariaLabel={translateText(["activate"])}
        />
        <Tooltip
          id="activate-leave-tooltip"
          content={translateText(["activateLeaveTooltipText"])}
        >
          <InfoIcon className="size-4 text-secondary-icon" />
        </Tooltip>
      </div>
      <SmallModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        modalHeader={
          policyLeaveType?.isActive
            ? translateText(["inactivateLeaveTypeModalTitle"])
            : translateText(["activateLeaveTypeModalTitle"])
        }
        content={
          <p className="body1 text-black">
            {policyLeaveType?.isActive
              ? translateText(["inactivatePolicyLeaveTypeModalDescription"])
              : translateText(["activatePolicyLeaveTypeModalDescription"])}
          </p>
        }
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: handleCloseConfirmModal,
            disabled: isPending,
            icon: <CloseIcon />,
            iconPosition: "end",
            children: translateText(["cancelBtn"])
          },
          buttonRight: {
            variant: policyLeaveType?.isActive ? "error" : "primary",
            onClick: handleConfirm,
            disabled: isPending,
            isLoading: isPending,
            icon: <TickIcon />,
            iconPosition: "end",
            children: translateText(["confirmAndSaveBtn"])
          }
        }}
      />
    </>
  );
};

export default PolicyLeaveTypeActivationToggleButton;
