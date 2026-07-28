import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  SmallModal,
  Table
} from "@rootcodelabs/skapp-ui";
import type { TableColumn } from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { FC, useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetLeavePoliciesInfinite } from "~community/leave/api/LeavePolicyApi";
import { useAssignLeavePolicy } from "~community/leave/api/LeavePolicyAssignmentApi";
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
  const [isSetHireDateOpen, setIsSetHireDateOpen] = useState<boolean>(false);

  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeById(employeeId);

  // With HIRE_DATE selected, the employee must have a hire date on record;
  // otherwise the primary action becomes "Set a hire date" first.
  const needsHireDate =
    effectiveDateType === EffectiveDateType.HIRE_DATE &&
    !isEmployeeLoading &&
    !employee?.joinDate;

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
      selectedPolicy && selectedPolicy.policyType === PolicyType.ACCRUAL
        ? buildAccrualPreview(selectedPolicy, previewStartISO)
        : [],
    [selectedPolicy, previewStartISO]
  );

  const accrualTableData = useMemo(
    () =>
      accrualPreview.map((row, index) => ({
        id: index,
        date: row.date,
        action: translateText(["actionAccrued"]),
        days: row.days,
        balance: row.balance
      })),
    [accrualPreview, translateText]
  );

  type AccrualTableRow = (typeof accrualTableData)[number];

  const accrualColumns: TableColumn<AccrualTableRow>[] = [
    {
      key: "date",
      header: translateText(["colDate"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "action",
      header: translateText(["colAction"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "days",
      header: translateText(["colDays"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "balance",
      header: translateText(["colBalance"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    }
  ];

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
    <>
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
              <DatePicker
                mode="single"
                selected={
                  specificDate
                    ? DateTime.fromISO(specificDate).toJSDate()
                    : undefined
                }
                onSelect={(date?: Date) => {
                  setSpecificDate(
                    date ? (DateTime.fromJSDate(date).toISODate() ?? "") : ""
                  );
                  setSpecificDateError("");
                }}
                popperProps={{ position: "bottom-start" }}
              >
                <div>
                  <InputField
                    name="specificDate"
                    value={
                      specificDate
                        ? DateTime.fromISO(specificDate).toJSDate().toLocaleDateString()
                        : ""
                    }
                    placeholder={translateText(["specificDatePlaceholder"])}
                    aria-label={translateText(["specificDatePlaceholder"])}
                    rightIcon={<CalendarIcon />}
                    state={specificDateError ? "error" : "default"}
                    errorMessage={specificDateError}
                    fullWidth
                    readOnly
                  />
                </div>
              </DatePicker>
            )}
          </div>

          {accrualPreview.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="body2 text-secondary-text">
                {translateText(["accrualPreviewTitle"])}
              </p>
              <Table<AccrualTableRow>
                columns={accrualColumns}
                data={accrualTableData}
                tableAriaLabel={translateText(["accrualPreviewTitle"])}
                height="14rem"
              />
            </div>
          )}
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleClose,
          disabled: isPending,
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: needsHireDate
          ? {
              variant: "primary",
              onClick: () => setIsSetHireDateOpen(true),
              disabled: isEmployeeLoading,
              children: translateText(["setHireDateBtnTxt"])
            }
          : {
              variant: "primary",
              onClick: handleSave,
              disabled: isSaveDisabled,
              isLoading: isPending,
              children: translateText(["saveBtnTxt"])
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
