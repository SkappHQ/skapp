import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InfoTipBanner,
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
  conflictWarning
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
    // The form owns its scroll because nothing above it does: SmallModal's
    // content wrapper and BasicModal's container are both unbounded and
    // overflow-visible, so a long accrual schedule would otherwise push the
    // modal footer past the viewport. 73vh leaves room for the modal's header,
    // footer and padding at the shortest supported viewport height.
    <div className="flex max-h-[73vh] flex-col gap-4 overflow-y-auto pr-2">
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

      {/* A flexible policy tracks no balance, so the accrual schedule is
          replaced by a plain explanation — never by an input. */}
      {isFlexiblePolicy && (
        <InfoTipBanner
          status="info"
          description={translateText(["assignModal", "flexibleInfoLabel"])}
        />
      )}

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
          />
        </div>
      )}
    </div>
  );
};

export default AssignLeavePolicyForm;
