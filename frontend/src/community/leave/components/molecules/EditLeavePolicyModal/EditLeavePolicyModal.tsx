import {
  CloseIcon,
  InputField,
  SaveIcon,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useUpdateLeavePolicy } from "~community/leave/api/LeavePolicyApi";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import {
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import { getLeavePolicyErrorToastKeys } from "~community/leave/utils/leavePolicy/leavePolicyUtils";
import { editLeavePolicyValidation } from "~community/leave/utils/validations";

interface EditLeavePolicyModalProps {
  policy: LeavePolicyType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditLeavePolicyFormValues {
  policyName: string;
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

  const onUpdateSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onUpdateError = (error: AxiosError): void => {
    const { title, description } = getLeavePolicyErrorToastKeys(error);

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([title]),
      description: translateText([description]),
      isIcon: true
    });
  };

  const { mutate: updateLeavePolicy, isPending } = useUpdateLeavePolicy(
    onUpdateSuccess,
    onUpdateError
  );

  const onSubmit = (formValues: EditLeavePolicyFormValues): void => {
    if (!policy) {
      return;
    }
    const trimmedName = formValues.policyName.trim();
    updateLeavePolicy({
      id: policy.id,
      payload: { name: trimmedName }
    });
  };

  const { values, errors, handleChange, handleSubmit, resetForm } = useFormik({
    initialValues: { policyName: policy?.name ?? "" },
    validationSchema: editLeavePolicyValidation(translateText),
    enableReinitialize: true,
    onSubmit
  });

  if (!policy) {
    return null;
  }

  const isChanged = values.policyName.trim() !== policy.name;
  const hasError = Boolean(errors.policyName);
  const isSaveDisabled = isPending || !isChanged || hasError;

  const handleCancel = (): void => {
    resetForm();
    onClose();
  };

  const handleSave = (): void => {
    handleSubmit();
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleCancel}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <InputField
            label={translateText(["policyNameLabel"])}
            name="policyName"
            type="text"
            value={values.policyName}
            state={errors.policyName ? "error" : "default"}
            errorMessage={errors.policyName}
            onChange={handleChange}
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <p className="subtitle1 text-secondary-icon">
              {translateText(["leaveTypeLabel"])}
            </p>
            <div className="flex items-center rounded-lg border border-border-surface-secondary bg-tertiary-background px-3 py-2">
              <LeaveTypeChip
                name={policy.leaveTypeName}
                emojiCode={policy.leaveTypeEmoji}
                className="bg-white px-4 py-2"
                isDisabled
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="subtitle1 text-secondary-icon">
              {translateText(["entitlementTypeLabel"])}
            </p>
            <div className="rounded-lg border border-border-surface-secondary bg-tertiary-background px-3 py-3 text-secondary-icon">
              <p className="body1 text-tertiary-icon">
                {policy.policyType === PolicyType.ACCRUAL
                  ? translateCommonText(["accrual"])
                  : translateCommonText(["flexible"])}
              </p>
            </div>
          </div>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleCancel,
          disabled: isPending,
          icon: <CloseIcon />,
          iconPosition: "end",
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: {
          variant: "primary",
          onClick: handleSave,
          disabled: isSaveDisabled,
          isLoading: isPending,
          icon: <SaveIcon className={isSaveDisabled ? "opacity-50" : ""} />,
          iconPosition: "end",
          children: translateText(["saveBtnTxt"])
        }
      }}
    />
  );
};

export default EditLeavePolicyModal;
