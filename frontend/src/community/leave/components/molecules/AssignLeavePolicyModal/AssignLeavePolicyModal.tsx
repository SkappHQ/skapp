import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetLeavePoliciesInfinite } from "~community/leave/api/LeavePolicyApi";
import { useAssignLeavePolicy } from "~community/leave/api/LeavePolicyAssignmentApi";
import AssignLeavePolicyForm from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyForm";
import SetHireDateModal from "~community/leave/components/molecules/SetHireDateModal/SetHireDateModal";
import {
  EffectiveDateType,
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import { buildAccrualPreview } from "~community/leave/utils/accrualPreviewUtils";
import { useGetEmployeeById } from "~community/people/api/PeopleApi";

interface Props {
  employeeId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ASSIGNABLE_POLICIES_PAGE_SIZE = 100;

const AssignLeavePolicyModal: FC<Props> = ({ employeeId, isOpen, onClose }) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");
  const { setToastMessage } = useToast();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [effectiveDateType, setEffectiveDateType] = useState<EffectiveDateType>(
    EffectiveDateType.HIRE_DATE
  );
  const [specificDate, setSpecificDate] = useState<string>("");
  const [specificDateError, setSpecificDateError] = useState<string>("");
  const [isSetHireDateOpen, setIsSetHireDateOpen] = useState<boolean>(false);

  const { data: employee, isLoading: isEmployeeLoading } = useGetEmployeeById(
    employeeId,
    isOpen
  );

  // With HIRE_DATE selected, the employee must have a hire date on record;
  // otherwise the primary action becomes "Set a hire date" first.
  const needsHireDate =
    effectiveDateType === EffectiveDateType.HIRE_DATE &&
    !isEmployeeLoading &&
    !employee?.joinDate;

  const { data: policyPages } = useGetLeavePoliciesInfinite({
    searchKeyword: "",
    leaveTypeId: "",
    size: ASSIGNABLE_POLICIES_PAGE_SIZE,
    enabled: isOpen
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

  const selectedPolicy = useMemo(
    () =>
      assignablePolicies.find(
        (policy) => String(policy.id) === selectedPolicyId
      ) ?? null,
    [assignablePolicies, selectedPolicyId]
  );

  const selectedPolicyName = selectedPolicy?.name ?? "";

  // Anchor the projection at the policy's actual effective date: the chosen
  // specific date, or the employee's hire date (fetched from the backend).
  const previewStartISO = useMemo(
    () =>
      effectiveDateType === EffectiveDateType.SPECIFIC
        ? specificDate || null
        : (employee?.joinDate ?? null),
    [effectiveDateType, specificDate, employee?.joinDate]
  );

  const accrualPreview = useMemo(
    () =>
      selectedPolicy?.policyType === PolicyType.ACCRUAL
        ? buildAccrualPreview(selectedPolicy, previewStartISO)
        : [],
    [selectedPolicy, previewStartISO]
  );

  const handleEffectiveDateTypeChange = (type: EffectiveDateType): void => {
    setEffectiveDateType(type);
    setSpecificDateError("");
  };

  const handleSpecificDateChange = (isoDate: string): void => {
    setSpecificDate(isoDate);
    setSpecificDateError("");
  };

  const onAssignSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["assignSuccessTitle"]),
      description: translateText(["assignSuccessDescription"], {
        policyName: selectedPolicyName
      }),
      isIcon: true
    });
    handleClose();
  };

  const onAssignError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorTitle"]),
      description: translateText(["assignErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: assignLeavePolicy, isPending } = useAssignLeavePolicy(
    employeeId,
    onAssignSuccess,
    onAssignError
  );

  const handleSave = (): void => {
    if (!selectedPolicyId) {
      return;
    }
    if (effectiveDateType === EffectiveDateType.SPECIFIC && !specificDate) {
      setSpecificDateError(
        translateText(["assignModal", "specificDateRequired"])
      );
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
    <>
      <SmallModal
        isOpen={isOpen}
        onClose={handleClose}
        modalHeader={translateText(["assignModal", "title"])}
        content={
          <AssignLeavePolicyForm
            selectedPolicyId={selectedPolicyId}
            policyOptions={policyOptions}
            onPolicyChange={setSelectedPolicyId}
            effectiveDateType={effectiveDateType}
            onEffectiveDateTypeChange={handleEffectiveDateTypeChange}
            specificDate={specificDate}
            specificDateError={specificDateError}
            onSpecificDateChange={handleSpecificDateChange}
            accrualPreview={accrualPreview}
          />
        }
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: handleClose,
            disabled: isPending,
            children: translateText(["assignModal", "cancelBtnTxt"])
          },
          buttonRight: needsHireDate
            ? {
                variant: "primary",
                onClick: () => setIsSetHireDateOpen(true),
                disabled: isEmployeeLoading,
                children: translateText(["assignModal", "setHireDateBtnTxt"])
              }
            : {
                variant: "primary",
                onClick: handleSave,
                disabled: isSaveDisabled,
                isLoading: isPending,
                children: translateText(["assignModal", "saveBtnTxt"])
              }
        }}
      />
      <SetHireDateModal
        employeeId={employeeId}
        isOpen={isSetHireDateOpen}
        onClose={() => setIsSetHireDateOpen(false)}
      />
    </>
  );
};

export default AssignLeavePolicyModal;
