import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { DateTime } from "luxon";
import { FC, MouseEvent, useEffect, useState } from "react";

import TimesheetFilterModal from "~community/attendance/components/molecules/TimesheetFilterModal/TimesheetFilterModal";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  convertDateToFormat,
  getFirstDateOfYear
} from "~community/common/utils/dateTimeUtils";

import styles from "./styles";

interface Props {
  isManager?: boolean;
}

const TimesheetRequestsFilters: FC<Props> = ({ isManager = false }: Props) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const translateAria = useTranslator(
    "attendanceAria",
    "timesheet",
    "timeEntryRequestTable"
  );
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId = filterBeOpen ? "filter-popper" : undefined;
  const classes = styles(theme);

  const {
    employeeSelectedTimesheetFilterLabels,
    selectedTimesheetFilterLabels,
    setEmployeeTimesheetSelectedFilterLabels,
    setEmployeeTimesheetRequestsFilters,
    resetEmployeeTimesheetRequestParams,
    setEmployeeTimesheetRequestSelectedDates,
    resetTimesheetRequestParamsToDefault,
    setTimesheetSelectedFilterLabels,
    setTimesheetRequestsFilters,
    resetTimesheetRequestParams,
    setTimesheetRequestSelectedDates
  } = useAttendanceStore((state) => state);

  const handleFilterClick = (event: MouseEvent<HTMLElement>): void => {
    setFilterEl(event.currentTarget);
    setFilterOpen((previousOpen) => !previousOpen);
  };

  const handleFilterClose = (): void => {
    setFilterEl(null);
    setFilterOpen(false);
  };

  const firstDateOfYear = getFirstDateOfYear(DateTime.now().year);

  const selectedFilterLabels = isManager
    ? selectedTimesheetFilterLabels
    : employeeSelectedTimesheetFilterLabels;

  const handleResetManager = () => {
    handleFilterClose();
    resetTimesheetRequestParams();
  };

  const handleApplyManager = (
    selectedFilters: Record<string, string[]>,
    selectedFilterLabels: string[]
  ) => {
    setTimesheetSelectedFilterLabels(selectedFilterLabels);
    setTimesheetRequestsFilters(selectedFilters);
    setFilterEl(null);
    setFilterOpen(false);
  };

  const handleResetEmployee = () => {
    handleFilterClose();
    resetEmployeeTimesheetRequestParams();
  };

  const handleApplyEmployee = (
    selectedFilters: Record<string, string[]>,
    selectedFilterLabels: string[]
  ) => {
    setEmployeeTimesheetSelectedFilterLabels(selectedFilterLabels);
    setEmployeeTimesheetRequestsFilters(selectedFilters);
    setFilterEl(null);
    setFilterOpen(false);
  };

  useEffect(() => {
    const convertedStartDate = selectedDates?.[0]
      ? convertDateToFormat(selectedDates[0], DATE_FORMAT)
      : "";
    const convertedEndDate = selectedDates?.[1]
      ? convertDateToFormat(selectedDates[1], DATE_FORMAT)
      : "";

    if (isManager) {
      setTimesheetRequestSelectedDates([convertedStartDate, convertedEndDate]);
    } else {
      setEmployeeTimesheetRequestSelectedDates([
        convertedStartDate,
        convertedEndDate
      ]);
    }
  }, [
    isManager,
    selectedDates,
    setEmployeeTimesheetRequestSelectedDates,
    setTimesheetRequestSelectedDates
  ]);

  useEffect(() => {
    return () => {
      resetTimesheetRequestParamsToDefault();
      resetEmployeeTimesheetRequestParams();
    };
  }, [
    resetEmployeeTimesheetRequestParams,
    resetTimesheetRequestParamsToDefault
  ]);

  return (
    <Stack
      sx={classes.stackContainer}
      flexDirection={"row"}
      justifyContent={"space-between"}
    >
      <Stack
        display={"flex"}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
      >
        <Typography variant="body2" sx={classes.fontStyles}>
          {translateText(["dateRangeLabel"])}
        </Typography>
        <DateRangePicker
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          minDate={firstDateOfYear.toJSDate()}
          hasBorder={true}
        />
      </Stack>
      <Box>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <FilterIconButton
            filterCount={selectedFilterLabels?.length ?? 0}
            onClick={handleFilterClick}
            aria-label={translateAria(["filterButton"])}
          />
        </Stack>
        <TimesheetFilterModal
          anchorEl={filterEl}
          handleClose={handleFilterClose}
          position="bottom-end"
          id={filterId}
          open={filterOpen}
          onApply={isManager ? handleApplyManager : handleApplyEmployee}
          onReset={isManager ? handleResetManager : handleResetEmployee}
          isManager={isManager}
        />
      </Box>
    </Stack>
  );
};

export default TimesheetRequestsFilters;
