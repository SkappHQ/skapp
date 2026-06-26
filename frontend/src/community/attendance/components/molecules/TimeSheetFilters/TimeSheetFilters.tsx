import { Box, Stack, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { TimesheetAnalyticsTabTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import TeamSelect from "~community/common/components/molecules/TeamSelect/TeamSelect";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import {
  convertDateToFormat,
  getFirstDateOfYear,
  getLocalDate,
  getStartAndEndOfCurrentMonth,
  getStartAndEndOfCurrentWeek
} from "~community/common/utils/dateTimeUtils";

interface Props {
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<TimesheetAnalyticsTabTypes>>;
  isTeamSelectionAvailable?: boolean;
  containerStyles?: SxProps;
}

const TimeSheetFilters = ({
  selectedTab,
  setSelectedTab,
  isTeamSelectionAvailable,
  containerStyles
}: Props) => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const theme: Theme = useTheme();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const {
    timesheetAnalyticsParams,
    setTimesheetAnalyticsSelectedDates,
    setTimesheetAnalyticsMonthWeek,
    setTimesheetAnalyticsTeam
  } = useAttendanceStore((state) => state);

  const firstDateOfYear = getFirstDateOfYear(DateTime.now().year);

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();
    const { startOfMonth, endOfMonth } = getStartAndEndOfCurrentMonth();
    const convertedStartDate = selectedDates?.[0]
      ? convertDateToFormat(selectedDates[0], DATE_FORMAT)
      : "";
    const convertedEndDate = selectedDates?.[1]
      ? convertDateToFormat(selectedDates[1], DATE_FORMAT)
      : "";
    if (selectedDates?.length > 0) {
      if (
        convertedStartDate === getLocalDate(startOfWeek) &&
        convertedEndDate === getLocalDate(endOfWeek)
      ) {
        setSelectedTab(TimesheetAnalyticsTabTypes.WEEK);
        setTimesheetAnalyticsMonthWeek(TimesheetAnalyticsTabTypes.WEEK);
      } else if (
        convertedStartDate === getLocalDate(startOfMonth) &&
        convertedEndDate === getLocalDate(endOfMonth)
      ) {
        setSelectedTab(TimesheetAnalyticsTabTypes.MONTH);
        setTimesheetAnalyticsMonthWeek(TimesheetAnalyticsTabTypes.MONTH);
      } else {
        setTimesheetAnalyticsSelectedDates([
          convertedStartDate,
          convertedEndDate
        ]);
        setTimesheetAnalyticsMonthWeek(TimesheetAnalyticsTabTypes.RANGE);
        setSelectedTab(TimesheetAnalyticsTabTypes.RANGE);
      }
    }
  }, [
    selectedDates,
    setSelectedTab,
    setTimesheetAnalyticsMonthWeek,
    setTimesheetAnalyticsSelectedDates
  ]);

  useEffect(() => {
    setTimesheetAnalyticsMonthWeek(selectedTab);
    if (selectedTab === TimesheetAnalyticsTabTypes.WEEK) {
      const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();
      setSelectedDates([startOfWeek, endOfWeek]);
    } else if (selectedTab === TimesheetAnalyticsTabTypes.MONTH) {
      const { startOfMonth, endOfMonth } = getStartAndEndOfCurrentMonth();
      setSelectedDates([new Date(startOfMonth), new Date(endOfMonth)]);
    }
  }, [selectedTab, setTimesheetAnalyticsMonthWeek]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "0.625rem"
        },
        ...containerStyles
      }}
    >
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <ButtonV2
          variant={
            selectedTab === TimesheetAnalyticsTabTypes.WEEK
              ? "secondary"
              : "tertiary"
          }
          isFullWidth={false}
          onClick={() => setSelectedTab(TimesheetAnalyticsTabTypes.WEEK)}
        >
          {translateText(["weekTabTxt"])}
        </ButtonV2>
        <ButtonV2
          variant={
            selectedTab === TimesheetAnalyticsTabTypes.MONTH
              ? "secondary"
              : "tertiary"
          }
          isFullWidth={false}
          onClick={() => setSelectedTab(TimesheetAnalyticsTabTypes.MONTH)}
        >
          {translateText(["monthTabTxt"])}
        </ButtonV2>
      </Box>
      <Stack
        display={"flex"}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        gap={1}
      >
        <Stack
          display={"flex"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography
            variant="body2"
            sx={{
              pr: "0.625rem"
            }}
          >
            {translateText(["dateRangeLabel"])}
          </Typography>
          <DateRangePicker
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            minDate={firstDateOfYear.toJSDate()}
          />
        </Stack>
        {isTeamSelectionAvailable && (
          <TeamSelect
            adminType={AdminTypes.ATTENDANCE_ADMIN}
            value={timesheetAnalyticsParams?.teamId.toString() || ""}
            onChange={(event) => {
              setTimesheetAnalyticsTeam(event.target.value);
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default TimeSheetFilters;
