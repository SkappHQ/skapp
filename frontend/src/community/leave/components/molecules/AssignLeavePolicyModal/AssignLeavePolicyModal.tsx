import { SmallModal } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC, useMemo, useState } from "react";

import { MEDIUM_DATE_FORMAT } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetLeavePoliciesInfinite } from "~community/leave/api/LeavePolicyApi";
import {
  useAssignLeavePolicy,
  useGetEmployeeLeavePolicies
} from "~community/leave/api/LeavePolicyAssignmentApi";
import AssignLeavePolicyForm from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyForm";
import SetJoinDateModal from "~community/leave/components/molecules/SetJoinDateModal/SetJoinDateModal";
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
  employeeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

// A negative size tells the backend to return every matching policy in a
// single page, so the assign dropdown lists all active policies (never capped).
const ASSIGNABLE_POLICIES_PAGE = -1;

// Conflict detection compares the selected policy against every leave type the
// employee already holds, so this page has to cover all of their assignments
// rather than just the first page shown in the list.
const EXISTING_ASSIGNMENTS_PAGE_SIZE = 100;

const AssignLeavePolicyModal: FC<Props> = ({
  employeeId,
  employeeName,
  isOpen,
  onClose
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");
  const { setToastMessage } = useToast();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [effectiveDateType, setEffectiveDateType] = useState<EffectiveDateType>(
    EffectiveDateType.JOIN_DATE
  );
  const [specificDate, setSpecificDate] = useState<string>("");
  const [specificDateError, setSpecificDateError] = useState<string>("");
  const [isSetJoinDateOpen, setIsSetJoinDateOpen] = useState<boolean>(false);

  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeById(employeeId);

  const joinedDate = employee?.employment?.employmentDetails?.joinedDate;

  const needsJoinDate =
    effectiveDateType === EffectiveDateType.JOIN_DATE &&
    !isEmployeeLoading &&
    !joinedDate;

  const { data: policyPages } = useGetLeavePoliciesInfinite({
    searchKeyword: "",
    leaveTypeId: "",
    size: ASSIGNABLE_POLICIES_PAGE,
    enabled: isOpen
  });

  const assignablePolicies: LeavePolicyType[] = useMemo(
    () =>
      (policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? []).filter(
        (policy) => policy.status === LeavePolicyStatus.ACTIVE
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
    setEffectiveDateType(EffectiveDateType.JOIN_DATE);
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
      ),
    [assignablePolicies, selectedPolicyId]
  );

  const selectedPolicyName = selectedPolicy?.name ?? "";

  const previewStartISO = useMemo(
    () =>
      effectiveDateType === EffectiveDateType.SPECIFIC
        ? specificDate
        : joinedDate,
    [effectiveDateType, specificDate, joinedDate]
  );

  // Save is only reachable once the effective date resolves — a specific date is
  // validated below, and a missing join date swaps Save for "Set a join date".
  const effectiveDateLabel = previewStartISO
    ? DateTime.fromISO(previewStartISO).toFormat(MEDIUM_DATE_FORMAT)
    : "";

  const accrualPreview = useMemo(
    () =>
      selectedPolicy?.policyType === PolicyType.ACCRUAL
        ? buildAccrualPreview(selectedPolicy, previewStartISO)
        : [],
    [selectedPolicy, previewStartISO]
  );

  const isFlexiblePolicy = selectedPolicy?.policyType === PolicyType.FLEXIBLE;

  const { data: existingAssignmentsPage } = useGetEmployeeLeavePolicies(
    employeeId,
    0,
    EXISTING_ASSIGNMENTS_PAGE_SIZE,
    isOpen
  );

  // Assigning a policy supersedes whatever the employee already holds for that
  // leave type. Re-selecting the policy they are already on is a no-op server
  // side, so that case is not flagged as a replacement.
  const conflictWarning = useMemo(() => {
    if (!selectedPolicy) return "";

    const replacedAssignment = existingAssignmentsPage?.items.find(
      (assignment) =>
        assignment.leaveTypeId === selectedPolicy.leaveTypeId &&
        assignment.policyId !== selectedPolicy.id
    );
    if (!replacedAssignment) return "";

    return translateText(["assignModal", "conflictWarning"], {
      employeeName: employeeName ?? "",
      leaveType: replacedAssignment.leaveTypeName
    });
  }, [selectedPolicy, existingAssignmentsPage, employeeName, translateText]);

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
        policyName: selectedPolicyName,
        employeeName: employeeName ?? "",
        effectiveDate: effectiveDateLabel
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
        isOpen={isOpen && !isSetJoinDateOpen}
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
            isFlexiblePolicy={isFlexiblePolicy}
            conflictWarning={conflictWarning}
          />
        }
        buttons={{
          buttonLeft: {
            variant: "tertiary",
            onClick: handleClose,
            disabled: isPending,
            children: translateText(["assignModal", "cancelBtnTxt"])
          },
          buttonRight: needsJoinDate
            ? {
                variant: "primary",
                onClick: () => setIsSetJoinDateOpen(true),
                disabled: isEmployeeLoading,
                children: translateText(["assignModal", "setJoinDateBtnTxt"])
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
      <SetJoinDateModal
        employeeId={employeeId}
        isOpen={isSetJoinDateOpen}
        onClose={() => setIsSetJoinDateOpen(false)}
      />
    </>
  );
};

export default AssignLeavePolicyModal;
