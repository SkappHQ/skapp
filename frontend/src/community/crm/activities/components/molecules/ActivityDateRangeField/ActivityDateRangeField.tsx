import {
  CalendarIcon,
  Chip,
  DatePicker,
  InputField
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ACTIVITY_DATE_PRESETS } from "~community/crm/activities/constants/activityConstants";
import { DateRange } from "~community/crm/activities/types/activityTypes";
import {
  getMatchingPreset,
  getPresetDateRange,
  toDateValue,
  toPickerDateRange,
  validateDateRange
} from "~community/crm/activities/utils/activityFilterUtil";

export interface ActivityDateRangeFieldProps {
  id: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  timeZone?: string;
}

const ActivityDateRangeField: FC<ActivityDateRangeFieldProps> = ({
  id,
  value,
  onChange,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const pickerRange = toPickerDateRange(value);
  const selectedPreset = getMatchingPreset(value, timeZone);
  const isValid = validateDateRange(value);
  const errorId = `${id}-error`;

  const handleFromSelect = (date?: Date) => {
    onChange({ ...value, from: toDateValue(date) });
  };

  const handleToSelect = (date?: Date) => {
    onChange({ ...value, to: toDateValue(date) });
  };

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={`${id}-label`}
      className="flex flex-col gap-3"
    >
      <p id={`${id}-label`} className="subtitle1">
        {translateText([
          "activities",
          "toolbar",
          "filters",
          "dateRange",
          "label"
        ])}
      </p>

      <div className="flex flex-wrap gap-2">
        {ACTIVITY_DATE_PRESETS.map((preset) => (
          <Chip
            key={preset.id}
            size="sm"
            label={translateText([
              "activities",
              "toolbar",
              "filters",
              "dateRange",
              "presets",
              preset.labelKey
            ])}
            isSelected={selectedPreset === preset.id}
            onClick={() => onChange(getPresetDateRange(preset.id, timeZone))}
          />
        ))}
      </div>

      <div className="flex flex-row items-start gap-3">
        <div className="flex-1 min-w-0">
          <DatePicker
            mode="single"
            selected={pickerRange.from}
            onSelect={handleFromSelect}
            popperProps={{ position: "bottom-start", isFlip: true }}
          >
            <div>
              <InputField
                id={`${id}-from`}
                label={translateText([
                  "activities",
                  "toolbar",
                  "filters",
                  "dateRange",
                  "from"
                ])}
                placeholder={translateText([
                  "activities",
                  "toolbar",
                  "filters",
                  "dateRange",
                  "fromPlaceholder"
                ])}
                aria-label={translateAria([
                  "activities",
                  "toolbar",
                  "fromDate"
                ])}
                value={pickerRange.from?.toLocaleDateString() ?? ""}
                rightIcon={<CalendarIcon />}
                state={isValid ? "default" : "error"}
                aria-invalid={!isValid}
                fullWidth
                readOnly
              />
            </div>
          </DatePicker>
        </div>

        <div className="flex-1 min-w-0">
          <DatePicker
            mode="single"
            selected={pickerRange.to}
            onSelect={handleToSelect}
            popperProps={{ position: "bottom-end", isFlip: true }}
          >
            <div>
              <InputField
                id={`${id}-to`}
                label={translateText([
                  "activities",
                  "toolbar",
                  "filters",
                  "dateRange",
                  "to"
                ])}
                placeholder={translateText([
                  "activities",
                  "toolbar",
                  "filters",
                  "dateRange",
                  "toPlaceholder"
                ])}
                aria-label={translateAria(["activities", "toolbar", "toDate"])}
                aria-describedby={isValid ? "" : errorId}
                value={pickerRange.to?.toLocaleDateString() ?? ""}
                rightIcon={<CalendarIcon />}
                state={isValid ? "default" : "error"}
                aria-invalid={!isValid}
                fullWidth
                readOnly
              />
            </div>
          </DatePicker>
        </div>
      </div>

      {!isValid && (
        <p id={errorId} role="alert" className="body3 text-semantic-red-accent">
          {translateText([
            "activities",
            "toolbar",
            "filters",
            "dateRange",
            "error"
          ])}
        </p>
      )}
    </div>
  );
};

export default ActivityDateRangeField;
