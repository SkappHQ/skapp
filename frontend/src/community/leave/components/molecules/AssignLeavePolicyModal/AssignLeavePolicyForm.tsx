import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InfoTipBanner,
  InputField,
  RadioButton,
  Tooltip
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

export interface PolicyOption {
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
  joinDateLabel: string;
  specificDate: string;
  specificDateError: string;
  onSpecificDateChange: (isoDate: string) => void;
  accrualPreview: AccrualPreviewRow[];
  isFlexiblePolicy: boolean;
  conflictWarning: string;
  joinDateWarning: string;
}

const AssignLeavePolicyForm: FC<Props> = ({
  selectedPolicyId,
  policyOptions,
  onPolicyChange,
  effectiveDateType,
  onEffectiveDateTypeChange,
  joinDateLabel,
  specificDate,
  specificDateError,
  onSpecificDateChange,
  accrualPreview,
  isFlexiblePolicy,
  conflictWarning,
  joinDateWarning
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");

  const accrualHeaders: GridHeader[] = [
    { id: "date", label: translateText(["assignModal", "colDate"]) },
    { id: "days", label: translateText(["assignModal", "colDays"]) },
    { id: "balance", label: translateText(["assignModal", "colBalance"]) }
  ];

  const accrualRows: GridRow[] = useMemo(
    () =>
      accrualPreview.map((row, index) => ({
        id: index,
        date: <span className="body2 text-black">{row.date}</span>,
        days: <span className="body2 text-black">{row.days}</span>,
        balance: <span className="body2 text-black">{row.balance}</span>
      })),
    [accrualPreview]
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

      {conflictWarning && (
        <InfoTipBanner status="warning" description={conflictWarning} />
      )}

      <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-2">
        <div className="flex flex-col gap-2">
          <p className="body2 text-secondary-text">
            {translateText(["assignModal", "effectiveDateLabel"])}
          </p>
          {joinDateWarning && (
            <InfoTipBanner status="warning" description={joinDateWarning} />
          )}
          <div
            role="radiogroup"
            aria-label={translateText(["assignModal", "effectiveDateLabel"])}
            className="flex flex-col gap-2"
          >
            <Tooltip
              content={translateText(["assignModal", "joinDateOptionTooltip"])}
              position="right"
            >
              <button
                type="button"
                role="radio"
                aria-checked={effectiveDateType === EffectiveDateType.JOIN_DATE}
                onClick={() =>
                  onEffectiveDateTypeChange(EffectiveDateType.JOIN_DATE)
                }
                className="flex w-fit cursor-pointer items-center gap-3"
              >
                <RadioButton
                  isSelected={effectiveDateType === EffectiveDateType.JOIN_DATE}
                  variant="dot"
                />
                <span className="body1 flex items-center gap-1.5 text-black">
                  {translateText(["assignModal", "joinDateOption"])}
                  {joinDateLabel && (
                    <span className="body2 text-secondary-text">
                      ({joinDateLabel})
                    </span>
                  )}
                </span>
              </button>
            </Tooltip>
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

        {isFlexiblePolicy && (
          <InfoTipBanner
            status="info"
            description={translateText(["assignModal", "flexibleInfoLabel"])}
          />
        )}

        {accrualPreview.length > 0 && (
          <div className="flex flex-col gap-2">
            <Tooltip
              content={translateText(["assignModal", "accrualPreviewTooltip"])}
              position="right"
            >
              <p className="body2 text-secondary-text">
                {translateText(["assignModal", "accrualPreviewTitle"])}
              </p>
            </Tooltip>
            <TableView
              ariaLabel={{
                regionAriaLabel: translateText([
                  "assignModal",
                  "accrualPreviewTitle"
                ])
              }}
              headers={accrualHeaders}
              rows={accrualRows}
              minHeight="min-h-[200px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignLeavePolicyForm;
