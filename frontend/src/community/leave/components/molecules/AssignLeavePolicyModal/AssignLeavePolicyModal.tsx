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
import AssignLeavePolicyForm, {
  PolicyOption
} from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyForm";
import SetJoinDateModal from "~community/leave/components/molecules/SetJoinDateModal/SetJoinDateModal";
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import {
  EffectiveDateType,
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import { buildAccrualPreview } from "~community/leave/utils/accrualPreviewUtils";
import { findSupersededAssignment } from "~community/leave/utils/leavePolicy/leavePolicyAssignmentUtils";
import { useGetEmployeeById } from "~community/people/api/PeopleApi";

interface Props {
  employeeId: number;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

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
    size: UNPAGINATED_SIZE,
    enabled: isOpen
  });

  const assignablePolicies: LeavePolicyType[] = useMemo(
    () =>
      (policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? []).filter(
        (policy) => policy.status === LeavePolicyStatus.ACTIVE
      ),
    [policyPages]
  );

  const policyOptions: PolicyOption[] = useMemo(
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

  const effectiveDateLabel = previewStartISO
    ? DateTime.fromISO(previewStartISO).toFormat(MEDIUM_DATE_FORMAT)
    : "";

  const joinDateLabel = joinedDate
    ? DateTime.fromISO(joinedDate).toFormat(MEDIUM_DATE_FORMAT)
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
    UNPAGINATED_SIZE,
    isOpen
  );

  const employeeSubject =
    employeeName || translateText(["employeeFallbackSubject"]);

  const conflictWarning = useMemo(() => {
    if (!selectedPolicy) return "";

    const supersededAssignment = findSupersededAssignment(
      existingAssignmentsPage?.items ?? [],
      selectedPolicy
    );
    if (!supersededAssignment) return "";

    return translateText(["assignModal", "conflictWarning"], {
      employeeName: employeeSubject,
      leaveType: supersededAssignment.leaveTypeName
    });
  }, [selectedPolicy, existingAssignmentsPage, employeeSubject, translateText]);

  const joinDateWarning = needsJoinDate
    ? translateText(["assignModal", "joinDateMissingLabel"], {
        employeeName: employeeSubject
      })
    : "";

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
        employeeName: employeeSubject,
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

  const isSaveDisabled = !selectedPolicyId || isPending || isEmployeeLoading;

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
            joinDateLabel={joinDateLabel}
            specificDate={specificDate}
            specificDateError={specificDateError}
            onSpecificDateChange={handleSpecificDateChange}
            accrualPreview={accrualPreview}
            isFlexiblePolicy={isFlexiblePolicy}
            conflictWarning={conflictWarning}
            joinDateWarning={joinDateWarning}
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
                children: translateText(["assignModal", "saveBtnTxt"])
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
