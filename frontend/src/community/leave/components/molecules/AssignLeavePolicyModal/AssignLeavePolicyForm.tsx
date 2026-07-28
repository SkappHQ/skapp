import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  RadioButton,
  Table
} from "@rootcodelabs/skapp-ui";
import type { TableColumn } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AccrualPreviewRow,
  EffectiveDateType
} from "~community/leave/types/LeavePolicyTypes";

interface PolicyOption {
  id: string;
  label: string;
  value: string;
}

type AccrualTableRow = {
  id: number;
  date: string;
  action: string;
  days: number;
  balance: number;
};

interface Props {
  selectedPolicyId: string;
  policyOptions: PolicyOption[];
  onPolicyChange: (value: string) => void;
  effectiveDateType: EffectiveDateType;
  onEffectiveDateTypeChange: (type: EffectiveDateType) => void;
  specificDate: string;
  specificDateError: string;
  onSpecificDateChange: (isoDate: string) => void;
  accrualPreview: AccrualPreviewRow[];
}

const AssignLeavePolicyForm: FC<Props> = ({
  selectedPolicyId,
  policyOptions,
  onPolicyChange,
  effectiveDateType,
  onEffectiveDateTypeChange,
  specificDate,
  specificDateError,
  onSpecificDateChange,
  accrualPreview
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");

  const accrualTableData: AccrualTableRow[] = useMemo(
    () =>
      accrualPreview.map((row, index) => ({
        id: index,
        date: row.date,
        action: translateText(["assignModal", "actionAccrued"]),
        days: row.days,
        balance: row.balance
      })),
    [accrualPreview, translateText]
  );

  const accrualColumns: TableColumn<AccrualTableRow>[] = [
    {
      key: "date",
      header: translateText(["assignModal", "colDate"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "action",
      header: translateText(["assignModal", "colAction"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "days",
      header: translateText(["assignModal", "colDays"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    },
    {
      key: "balance",
      header: translateText(["assignModal", "colBalance"]),
      render: (value) => (
        <span className="body2 text-black">{String(value)}</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="body2 text-secondary-text">
          {translateText(["assignModal", "policyLabel"])}
        </p>
        <Dropdown
          id="assign-leave-policy-dropdown"
          ariaLabel={translateText(["assignModal", "policyLabel"])}
          value={selectedPolicyId}
          options={policyOptions}
          placeholder={translateText(["assignModal", "policyPlaceholder"])}
          onChange={(value: string) => onPolicyChange(value)}
          width="100%"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="body2 text-secondary-text">
          {translateText(["assignModal", "effectiveDateLabel"])}
        </p>
        <div
          role="radiogroup"
          aria-label={translateText(["assignModal", "effectiveDateLabel"])}
          className="flex flex-col gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={effectiveDateType === EffectiveDateType.HIRE_DATE}
            onClick={() => onEffectiveDateTypeChange(EffectiveDateType.HIRE_DATE)}
            className="flex w-fit cursor-pointer items-center gap-3"
          >
            <RadioButton
              isSelected={effectiveDateType === EffectiveDateType.HIRE_DATE}
              variant="dot"
            />
            <span className="body1 text-black">
              {translateText(["assignModal", "hireDateOption"])}
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={effectiveDateType === EffectiveDateType.SPECIFIC}
            onClick={() => onEffectiveDateTypeChange(EffectiveDateType.SPECIFIC)}
            className="flex w-fit cursor-pointer items-center gap-3"
          >
            <RadioButton
              isSelected={effectiveDateType === EffectiveDateType.SPECIFIC}
              variant="dot"
            />
            <span className="body1 text-black">
              {translateText(["assignModal", "specificDateOption"])}
            </span>
          </button>
        </div>
        {effectiveDateType === EffectiveDateType.SPECIFIC && (
          <DatePicker
            mode="single"
            selected={
              specificDate
                ? DateTime.fromISO(specificDate).toJSDate()
                : undefined
            }
            onSelect={(date?: Date) =>
              onSpecificDateChange(
                date ? (DateTime.fromJSDate(date).toISODate() ?? "") : ""
              )
            }
            popperProps={{ position: "bottom-start" }}
          >
            <div>
              <InputField
                name="specificDate"
                value={
                  specificDate
                    ? DateTime.fromISO(specificDate)
                        .toJSDate()
                        .toLocaleDateString()
                    : ""
                }
                placeholder={translateText([
                  "assignModal",
                  "specificDatePlaceholder"
                ])}
                aria-label={translateText([
                  "assignModal",
                  "specificDatePlaceholder"
                ])}
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
            {translateText(["assignModal", "accrualPreviewTitle"])}
          </p>
          <Table<AccrualTableRow>
            columns={accrualColumns}
            data={accrualTableData}
            tableAriaLabel={translateText([
              "assignModal",
              "accrualPreviewTitle"
            ])}
            height="14rem"
          />
        </div>
      )}
    </div>
  );
};

export default AssignLeavePolicyForm;
