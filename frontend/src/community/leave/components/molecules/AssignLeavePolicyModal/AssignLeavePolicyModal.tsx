import { Dropdown, SmallModal } from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { FC, useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetLeavePoliciesInfinite } from "~community/leave/api/LeavePolicyApi";
import { useAssignLeavePolicy } from "~community/leave/api/LeavePolicyAssignmentApi";
import {
  EffectiveDateType,
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  employeeId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ASSIGNABLE_POLICIES_PAGE_SIZE = 100;

const AssignLeavePolicyModal: FC<Props> = ({ employeeId, isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment",
    "assignModal"
  );
  const translateSectionText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment"
  );
  const { setToastMessage } = useToast();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [effectiveDateType, setEffectiveDateType] = useState<EffectiveDateType>(
    EffectiveDateType.HIRE_DATE
  );
  const [specificDate, setSpecificDate] = useState<string>("");
  const [specificDateError, setSpecificDateError] = useState<string>("");

  const { data: policyPages } = useGetLeavePoliciesInfinite({
    searchKeyword: "",
    leaveTypeId: "",
    size: ASSIGNABLE_POLICIES_PAGE_SIZE
  });

  const assignablePolicies: LeavePolicyType[] = useMemo(
    () =>
      (policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? []).filter(
        (policy) =>
          policy.status === LeavePolicyStatus.ACTIVE &&
          policy.policyType === PolicyType.ACCRUAL
      ),
    [policyPages]
  );

  const policyOptions = useMemo(
    () =>
      assignablePolicies.map((policy) => ({
        id: String(policy.id),
        label: policy.name,
        value: String(policy.id)
      })),
    [assignablePolicies]
  );

  const resetForm = (): void => {
    setSelectedPolicyId("");
    setEffectiveDateType(EffectiveDateType.HIRE_DATE);
    setSpecificDate("");
    setSpecificDateError("");
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const selectedPolicyName = useMemo(
    () =>
      assignablePolicies.find(
        (policy) => String(policy.id) === selectedPolicyId
      )?.name ?? "",
    [assignablePolicies, selectedPolicyId]
  );

  const onAssignSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateSectionText(["assignSuccessTitle"]),
      description: translateSectionText(["assignSuccessDescription"], {
        policyName: selectedPolicyName
      }),
      isIcon: true
    });
    handleClose();
  };

  const onAssignError = (_error: AxiosError): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateSectionText(["errorTitle"]),
      description: translateSectionText(["assignErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: assignLeavePolicy, isPending } = useAssignLeavePolicy(
    onAssignSuccess,
    onAssignError
  );

  const handleSave = (): void => {
    if (!selectedPolicyId) {
      return;
    }
    if (effectiveDateType === EffectiveDateType.SPECIFIC && !specificDate) {
      setSpecificDateError(translateText(["specificDateRequired"]));
      return;
    }
    assignLeavePolicy({
      employeeId,
      policyId: Number(selectedPolicyId),
      effectiveDateType,
      ...(effectiveDateType === EffectiveDateType.SPECIFIC
        ? { specificDate }
        : {})
    });
  };

  const isSaveDisabled = !selectedPolicyId || isPending;

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="body2 text-secondary-text">
              {translateText(["policyLabel"])}
            </p>
            <Dropdown
              id="assign-leave-policy-dropdown"
              ariaLabel={translateText(["policyLabel"])}
              value={selectedPolicyId}
              options={policyOptions}
              placeholder={translateText(["policyPlaceholder"])}
              onChange={(value: string) => setSelectedPolicyId(value)}
              width="100%"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="body2 text-secondary-text">
              {translateText(["effectiveDateLabel"])}
            </p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="effectiveDateType"
                value={EffectiveDateType.HIRE_DATE}
                checked={effectiveDateType === EffectiveDateType.HIRE_DATE}
                onChange={() => {
                  setEffectiveDateType(EffectiveDateType.HIRE_DATE);
                  setSpecificDateError("");
                }}
              />
              <span className="body1 text-black">
                {translateText(["hireDateOption"])}
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="effectiveDateType"
                value={EffectiveDateType.SPECIFIC}
                checked={effectiveDateType === EffectiveDateType.SPECIFIC}
                onChange={() =>
                  setEffectiveDateType(EffectiveDateType.SPECIFIC)
                }
              />
              <span className="body1 text-black">
                {translateText(["specificDateOption"])}
              </span>
            </label>
            {effectiveDateType === EffectiveDateType.SPECIFIC && (
              <div className="flex flex-col gap-1">
                <input
                  type="date"
                  aria-label={translateText(["specificDatePlaceholder"])}
                  value={specificDate}
                  onChange={(event) => {
                    setSpecificDate(event.target.value);
                    setSpecificDateError("");
                  }}
                  className="rounded-lg border border-grey-300 px-3 py-2"
                />
                {specificDateError && (
                  <p className="caption text-error-text">{specificDateError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleClose,
          disabled: isPending,
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: {
          variant: "primary",
          onClick: handleSave,
          disabled: isSaveDisabled,
          isLoading: isPending,
          children: translateText(["saveBtnTxt"])
        }
      }}
    />
  );
};

export default AssignLeavePolicyModal;
