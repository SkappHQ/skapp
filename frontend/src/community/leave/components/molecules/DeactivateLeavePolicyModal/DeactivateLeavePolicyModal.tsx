import {
  CircleMinusIcon,
  CloseIcon,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeactivateLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import { LeavePolicyType } from "~community/leave/types/LeavePolicyTypes";

interface DeactivateLeavePolicyModalProps {
  policy: LeavePolicyType | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeactivateLeavePolicyModal: FC<DeactivateLeavePolicyModalProps> = ({
  policy,
  isOpen,
  onClose
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "deactivatePolicyModal"
  );
  const { setToastMessage } = useToast();

  const { mutate: deactivateLeavePolicy, isPending } = useDeactivateLeavePolicy(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["successToastTitle"]),
        description: translateText(["successToastDescription"], {
          policyName: policy?.name ?? ""
        }),
        isIcon: true
      });
      onClose();
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["errorToastTitle"]),
        description: translateText(["errorToastDescription"]),
        isIcon: true
      });
    }
  );

  if (!policy) {
    return null;
  }

  const handleConfirm = (): void => {
    if (isPending) {
      return;
    }
    deactivateLeavePolicy(policy.policyId);
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-2">
          <p className="body1 text-black">
            {translateText(["descriptionTitle"])}
          </p>
          <ul className="list-disc pl-6">
            <li className="body1 text-black">
              {translateText(["consequenceRemoveFromDropdowns"])}
            </li>
            <li className="body1 text-black">
              {translateText(["consequenceRemoveEntitlement"])}
            </li>
          </ul>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          disabled: isPending,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleConfirm,
          disabled: isPending,
          isLoading: isPending,
          icon: (
            <CircleMinusIcon
              fill="var(--color-semantic-red-text)"
              width="14"
              height="14"
            />
          ),
          iconPosition: "end",
          children: translateText(["deactivateBtnTxt"])
        }
      }}
    />
  );
};

export default DeactivateLeavePolicyModal;
