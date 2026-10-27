import {
  CalendarIcon,
  Chip,
  DatePicker,
  InputField
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { convertToYYYYMMDDFromDate } from "~community/common/utils/dateTimeUtils";
import { ACTIVITY_DATE_PRESETS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityDatePreset,
  ActivityDateRange
} from "~community/crm/activities/types/activityTypes";
import {
  getDateRangeForPreset,
  getMatchingPreset,
  toPickerDateRange,
  validateDateRange
} from "~community/crm/activities/utils/activityFilterUtil";

export interface ActivityDateRangeFieldProps {
  id: string;
  value: ActivityDateRange;
  onChange: (range: ActivityDateRange) => void;
  timeZone?: string;
}

const ActivityDateRangeField: FC<ActivityDateRangeFieldProps> = ({
  id,
  value,
  onChange,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");

  const PRESET_LABEL_KEYS: Record<ActivityDatePreset, string> = {
    [ActivityDatePreset.TODAY]: "today",
    [ActivityDatePreset.THIS_WEEK]: "thisWeek",
    [ActivityDatePreset.THIS_MONTH]: "thisMonth",
    [ActivityDatePreset.LAST_30_DAYS]: "last30Days"
  };

  const pickerRange = toPickerDateRange(value);
  const selectedPreset = getMatchingPreset(value, timeZone);
  const isValid = validateDateRange(value);

  const handleFromSelect = (date?: Date): void => {
    onChange({
      ...(date ? { fromDate: convertToYYYYMMDDFromDate(date) } : {}),
      ...(value.toDate ? { toDate: value.toDate } : {})
    });
  };

  const handleToSelect = (date?: Date): void => {
    onChange({
      ...(value.fromDate ? { fromDate: value.fromDate } : {}),
      ...(date ? { toDate: convertToYYYYMMDDFromDate(date) } : {})
    });
  };

  return (
    <fieldset
      id={id}
      aria-labelledby={`${id}-label`}
      className="flex min-w-0 flex-col gap-3"
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
            key={preset}
            size="sm"
            label={translateText([
              "activities",
              "toolbar",
              "filters",
              "dateRange",
              "presets",
              PRESET_LABEL_KEYS[preset]
            ])}
            isSelected={selectedPreset === preset}
            onClick={() => onChange(getDateRangeForPreset(preset, timeZone))}
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
                {...(isValid ? {} : { "aria-describedby": `${id}-error` })}
                value={
                  pickerRange.from ? pickerRange.from.toLocaleDateString() : ""
                }
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
                {...(isValid ? {} : { "aria-describedby": `${id}-error` })}
                value={
                  pickerRange.to ? pickerRange.to.toLocaleDateString() : ""
                }
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
        <p
          id={`${id}-error`}
          role="alert"
          className="body3 text-semantic-red-accent"
        >
          {translateText([
            "activities",
            "toolbar",
            "filters",
            "dateRange",
            "error"
          ])}
        </p>
      )}
    </fieldset>
  );
};

export default ActivityDateRangeField;
