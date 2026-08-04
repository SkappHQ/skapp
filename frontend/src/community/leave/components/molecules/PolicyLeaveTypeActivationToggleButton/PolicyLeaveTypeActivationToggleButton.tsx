import {
  CheckIcon,
  CloseIcon,
  InfoIcon,
  SmallModal,
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
  useChangePolicyLeaveTypeStatus,
  useGetPolicyLeaveType
} from "~community/leave/api/PolicyLeaveTypeApi";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { getPolicyLeaveTypeErrorToastKeys } from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";

const PolicyLeaveTypeActivationToggleButton: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();
  const { id } = router.query;

  const policyLeaveTypeId = id ? Number(id) : undefined;

  const canManageLeavePolicies = useCanManageLeavePolicies();

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

    changeStatus({ id: policyLeaveTypeId, isActive: !isActive });
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
          checked={isActive}
          disabled={!policyLeaveType || isPending}
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
          isActive
            ? translateText(["inactivateLeaveTypeModalTitle"])
            : translateText(["activateLeaveTypeModalTitle"])
        }
        content={
          <p className="body1 text-black">
            {isActive
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
            variant: isActive ? "error" : "primary",
            onClick: handleConfirm,
            disabled: isPending,
            isLoading: isPending,
            icon: <CheckIcon />,
            iconPosition: "end",
            children: translateText(["confirmAndSaveBtn"])
          }
        }}
      />
    </>
  );
};

export default PolicyLeaveTypeActivationToggleButton;
