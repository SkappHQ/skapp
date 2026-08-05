import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  RadioButton
} from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
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

  const accrualHeaders: GridHeader[] = [
    { id: "date", label: translateText(["assignModal", "colDate"]) },
    { id: "action", label: translateText(["assignModal", "colAction"]) },
    { id: "days", label: translateText(["assignModal", "colDays"]) },
    { id: "balance", label: translateText(["assignModal", "colBalance"]) }
  ];

  const accrualRows: GridRow[] = useMemo(
    () =>
      accrualPreview.map((row, index) => ({
        id: index,
        date: <span className="body2 text-black">{row.date}</span>,
        action: (
          <span className="body2 text-black">
            {translateText(["assignModal", "actionAccrued"])}
          </span>
        ),
        days: <span className="body2 text-black">{row.days}</span>,
        balance: <span className="body2 text-black">{row.balance}</span>
      })),
    [accrualPreview, translateText]
  );

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
            onClick={() =>
              onEffectiveDateTypeChange(EffectiveDateType.HIRE_DATE)
            }
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
            onClick={() =>
              onEffectiveDateTypeChange(EffectiveDateType.SPECIFIC)
            }
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
          <TableView
            ariaLabel={{
              regionAriaLabel: translateText([
                "assignModal",
                "accrualPreviewTitle"
              ])
            }}
            headers={accrualHeaders}
            rows={accrualRows}
            height="14rem"
          />
        </div>
      )}
    </div>
  );
};

export default AssignLeavePolicyForm;
