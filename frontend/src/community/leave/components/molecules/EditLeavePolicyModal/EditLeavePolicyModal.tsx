import {
  CloseIcon,
  InputField,
  SaveIcon,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useUpdateLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import { MAX_POLICY_NAME_LENGTH } from "~community/leave/constants/leavePolicyConstants";
import { LeavePolicyType, PolicyType } from "~community/leave/types/LeavePolicyTypes";

interface EditLeavePolicyModalProps {
  policy: LeavePolicyType | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditLeavePolicyModal: FC<EditLeavePolicyModalProps> = ({
  policy,
  isOpen,
  onClose
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "editPolicyModal"
  );
  const translateCommonText = useTranslator("leaveModule", "leavePolicies");
  const { setToastMessage } = useToast();

  const [policyName, setPolicyName] = useState<string>("");

  useEffect(() => {
    if (policy) {
      setPolicyName(policy.name);
    }
  }, [policy]);

  const { mutate: updateLeavePolicy, isPending } = useUpdateLeavePolicy(
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["successToastTitle"]),
        description: translateText(["successToastDescription"], {
          policyName: policyName.trim()
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

  const trimmedName = policyName.trim();
  const isNameEmpty = trimmedName.length === 0;
  const isNameTooLong = trimmedName.length > MAX_POLICY_NAME_LENGTH;
  const isNameValid = !isNameEmpty && !isNameTooLong;
  const isChanged = trimmedName !== policy.name;

  const handleDiscard = (): void => {
    setPolicyName(policy.name);
    onClose();
  };

  const handleSave = (): void => {
    if (!isNameValid || !isChanged || isPending) {
      return;
    }
    updateLeavePolicy({
      policyId: policy.policyId,
      payload: { name: trimmedName }
    });
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleDiscard}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <InputField
            label={translateText(["policyNameLabel"])}
            name="policyName"
            type="text"
            value={policyName}
            errorMessage={
              isNameEmpty
                ? translateText(["policyNameRequiredError"])
                : isNameTooLong
                  ? translateText(["policyNameMaxLengthError"])
                  : undefined
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPolicyName(event.target.value)
            }
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <p className="body2 text-secondary-text">
              {translateText(["leaveTypeLabel"])}
            </p>
            <div className="flex items-center rounded-lg bg-tertiary-background px-3 py-2">
              <span className="body2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-secondary-text">
                {policy.leaveTypeEmoji && (
                  <span role="img" aria-hidden="true">
                    {getEmoji(policy.leaveTypeEmoji)}
                  </span>
                )}
                {policy.leaveTypeName}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="body2 text-secondary-text">
              {translateText(["entitlementTypeLabel"])}
            </p>
            <div className="rounded-lg bg-tertiary-background px-3 py-3">
              <p className="body1 text-secondary-text">
                {policy.policyType === PolicyType.ACCRUAL
                  ? translateCommonText(["accrual"])
                  : translateCommonText(["fixed"])}
              </p>
            </div>
          </div>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleDiscard,
          disabled: isPending,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["discardBtnTxt"])
        },
        buttonRight: {
          variant: "primary",
          onClick: handleSave,
          disabled: isPending || !isNameValid || !isChanged,
          isLoading: isPending,
          icon: <SaveIcon />,
          iconPosition: "end",
          children: translateText(["saveBtnTxt"])
        }
      }}
    />
  );
};

export default EditLeavePolicyModal;
