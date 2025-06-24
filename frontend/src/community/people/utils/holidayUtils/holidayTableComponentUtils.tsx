import { Box, Typography } from "@mui/material";

import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";
import { generateHolidayTableRowAriaLabel } from "~community/people/utils/accessibilityUtils";

import { getFormattedDate } from "./commonUtils";

export const returnDurationLabel = (
  duration: HolidayDurationType,
  translateText: (key: string[]) => string
): string => {
  switch (duration) {
    case HolidayDurationType.FULLDAY:
      return translateText(["fullDay"]);
    case HolidayDurationType.HALFDAY_MORNING:
      return translateText(["halfDayMorning"]);
    case HolidayDurationType.HALFDAY_EVENING:
      return translateText(["halfDayEvening"]);
    default:
      return duration;
  }
};

export const getTableHeaders = (translateText: (key: string[]) => string) => [
  { id: "date", label: translateText(["tableDateColumnTitle"]) },
  {
    id: "holidayName",
    label: translateText(["tableHolidayNameColumnTitle"])
  }
];

export const transformToTableRows = (
  holidayData: Holiday[] | undefined,
  translateText: (key: string[]) => string,
  translateAria: (key: string[], params?: Record<string, any>) => string,
  isRowDisabled: (id: number) => boolean,
  dateWrapperStyles: any
) => {
  return (
    (Array.isArray(holidayData) &&
      holidayData.map((holiday) => ({
        id: holiday.id,
        ariaLabel: {
          checkbox: translateAria(["selectHoliday"], {
            holidayName: holiday.name
          }),
          row: generateHolidayTableRowAriaLabel(
            translateAria,
            getFormattedDate(holiday?.date || "", true),
            returnDurationLabel(
              holiday?.holidayDuration || HolidayDurationType.NONE,
              translateText
            ),
            holiday.name,
            isRowDisabled(holiday.id)
          ),
          deleteButton: translateAria(["deleteHoliday"], {
            holidayName: holiday.name
          })
        },
        date: (
          <Box sx={dateWrapperStyles}>
            <Typography variant="body1">
              {getFormattedDate(holiday?.date || "", true)}
            </Typography>
            <ReadOnlyChip
              label={returnDurationLabel(
                holiday?.holidayDuration || HolidayDurationType.NONE,
                translateText
              )}
              chipStyles={{
                mx: "0.3125rem",
                cursor: isRowDisabled(holiday.id) ? "not-allowed" : "pointer"
              }}
            />
          </Box>
        ),
        holidayName: holiday?.name,
        actionData: holiday?.id
      }))) ||
    []
  );
};
