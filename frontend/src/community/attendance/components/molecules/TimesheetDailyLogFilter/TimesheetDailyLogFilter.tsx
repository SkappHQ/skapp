import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import {
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
  StaticDatePicker
} from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import {
  Dispatch,
  JSX,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState
} from "react";

import {
  DAY_MONTH_FORMAT,
  DAY_MONTH_YEAR_FORMAT,
  MONTH_YEAR_FORMAT
} from "~community/attendance/constants/constants";
import { DailyLogFilterTabTypes } from "~community/attendance/enums/timesheetEnums";
import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import SortRow from "~community/common/components/atoms/SortRow/SortRow";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import {
  convertDateToFormat,
  getFirstDateOfYear,
  getLocalDate,
  getStartAndEndOfCurrentWeek
} from "~community/common/utils/dateTimeUtils";

import styles from "./styles";

interface Props {
  setStartTime: Dispatch<SetStateAction<string>>;
  setEndTime: Dispatch<SetStateAction<string>>;
}

const TimesheetDailyLogFilter = ({
  setStartTime,
  setEndTime
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const translateAria = useTranslator(
    "attendanceAria",
    "timesheet",
    "dailyLogTable"
  );
  const classes = styles(theme);

  const [showOverlayDropdown, setShowOverlayDropdown] =
    useState<boolean>(false);
  const [showOverlayDateRange, setShowOverlayDateRange] =
    useState<boolean>(false);
  const [anchorElDropdown, setAnchorElDropdown] = useState<HTMLElement | null>(
    null
  );
  const [selectedOptionName, setSelectedOptionName] =
    useState<DailyLogFilterTabTypes>(DailyLogFilterTabTypes.WEEK);
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekEndDate, setWeekEndDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<DateTime>(
    DateTime.local()
  );
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const closeDropdownMenu = (): void => {
    setShowOverlayDropdown(false);
  };

  const closeDateRangeMenu = (): void => {
    setShowOverlayDateRange(false);
  };

  const firstDateOfYear = getFirstDateOfYear(DateTime.now().year);

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();
    setWeekStartDate(startOfWeek);
    setWeekEndDate(endOfWeek);

    const currentMonth = DateTime.local();
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    setSelectedDates([DateTime.local().startOf("day").toJSDate()]);
  }, [selectedOptionName]);

  const goForward = () => {
    if (selectedOptionName === DailyLogFilterTabTypes.WEEK) {
      const startOfWeek = DateTime.fromJSDate(weekStartDate)
        .plus({ weeks: 1 })
        .toJSDate();
      const endOfWeek = DateTime.fromJSDate(weekEndDate)
        .plus({ weeks: 1 })
        .toJSDate();
      setWeekStartDate(startOfWeek);
      setWeekEndDate(endOfWeek);
    } else if (selectedOptionName === DailyLogFilterTabTypes.MONTH) {
      const nextMonth = selectedMonth.plus({ month: 1 });
      setSelectedMonth(nextMonth);
    }
  };

  const goBackward = () => {
    if (selectedOptionName === DailyLogFilterTabTypes.WEEK) {
      const startOfWeek = DateTime.fromJSDate(weekStartDate)
        .minus({ weeks: 1 })
        .toJSDate();
      const endOfWeek = DateTime.fromJSDate(weekEndDate)
        .minus({ weeks: 1 })
        .toJSDate();
      setWeekStartDate(startOfWeek);
      setWeekEndDate(endOfWeek);
    } else if (selectedOptionName === DailyLogFilterTabTypes.MONTH) {
      const prevMonth = selectedMonth.minus({ month: 1 });
      setSelectedMonth(prevMonth);
    }
  };

  const handleDateChange = (date: DateTime | null) => {
    if (!date) return;
    const jsDate = date.startOf("day").toJSDate();
    if (selectedDates.length === 2) {
      setSelectedDates([jsDate]);
    } else {
      if (selectedDates.length === 1) {
        if (date > DateTime.fromJSDate(selectedDates[0])) {
          setSelectedDates([selectedDates[0], jsDate]);
        } else {
          setSelectedDates([jsDate, selectedDates[0]]);
        }
      } else {
        setSelectedDates([jsDate]);
      }
    }
  };

  const isForwardButtonHidden = () => {
    if (selectedOptionName === DailyLogFilterTabTypes.WEEK) {
      const startOfWeek = DateTime.fromJSDate(weekStartDate)
        .plus({ weeks: 1 })
        .toJSDate();
      return startOfWeek > new Date();
    } else if (selectedOptionName === DailyLogFilterTabTypes.MONTH) {
      const nextMonth = selectedMonth.plus({ month: 1 });
      return nextMonth.toJSDate() > new Date();
    }
  };

  const isBackButtonHidden = () => {
    if (selectedOptionName === DailyLogFilterTabTypes.WEEK) {
      const startOfWeek = DateTime.fromJSDate(weekStartDate)
        .minus({ weeks: 1 })
        .toJSDate();
      return startOfWeek.getFullYear() < new Date().getFullYear();
    } else if (selectedOptionName === DailyLogFilterTabTypes.MONTH) {
      const previousMonth = selectedMonth.minus({ months: 1 });
      return previousMonth.toJSDate().getFullYear() < new Date().getFullYear();
    }
  };

  useEffect(() => {
    if (selectedOptionName === DailyLogFilterTabTypes.WEEK) {
      setStartTime(getLocalDate(weekStartDate));
      setEndTime(getLocalDate(weekEndDate));
    } else if (selectedOptionName === DailyLogFilterTabTypes.MONTH) {
      setStartTime(getLocalDate(selectedMonth.startOf("month").toISODate()!));
      setEndTime(getLocalDate(selectedMonth.endOf("month").toISODate()!));
    } else if (
      selectedOptionName === DailyLogFilterTabTypes.CUSTOM_RANGE &&
      selectedDates.length === 2
    ) {
      setStartTime(getLocalDate(selectedDates[0]));
      setEndTime(getLocalDate(selectedDates[1]));
    }
  }, [
    selectedDates,
    selectedDates.length,
    selectedMonth,
    selectedOptionName,
    setEndTime,
    setStartTime,
    weekEndDate,
    weekStartDate
  ]);

  const CustomPickerDay = (props: PickersDayProps<DateTime>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const isSelected = selectedDates.some(
      (date) => DateTime.fromJSDate(date).toMillis() === day.toMillis()
    );

    const isInRange =
      selectedDates.length === 2 &&
      day > DateTime.fromJSDate(selectedDates[0]) &&
      day < DateTime.fromJSDate(selectedDates[1]);

    const selectedMuiClass = isSelected ? "Mui-selected" : "";
    const inRangedMuiClass = isInRange ? "Mui-ranged" : "";

    return (
      <PickersDay
        className={`${selectedMuiClass} ${inRangedMuiClass}`}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.dark,
            color: "white"
          },
          "&.Mui-ranged": {
            backgroundColor: theme.palette.primary.main
          },
          "&:hover": {
            backgroundColor: theme.palette.primary.light
          }
        }}
        {...other}
      />
    );
  };

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Stack direction={"row"} alignItems={"center"} gap={"1.5rem"}>
        {selectedOptionName !== DailyLogFilterTabTypes.CUSTOM_RANGE &&
          !isBackButtonHidden() && (
            <IconButton
              icon={
                <Icon
                  name={IconName.CHEVRON_LEFT_ICON}
                  fill={theme.palette.common.black}
                />
              }
              buttonStyles={classes.iconButtonStyles}
              onClick={() => goBackward()}
              ariaLabel={`${translateAria(["previousButton"])} ${selectedOptionName?.toLowerCase()}`}
            />
          )}
        {selectedOptionName === DailyLogFilterTabTypes.WEEK && (
          <Typography fontSize={"1.25rem"} fontWeight={"600"}>
            {convertDateToFormat(weekStartDate, DAY_MONTH_FORMAT)} -{" "}
            {convertDateToFormat(weekEndDate, DAY_MONTH_YEAR_FORMAT)}
          </Typography>
        )}
        {selectedOptionName === DailyLogFilterTabTypes.MONTH && (
          <Typography fontSize={"1.25rem"} fontWeight={"600"}>
            {convertDateToFormat(selectedMonth.toJSDate(), MONTH_YEAR_FORMAT)}
          </Typography>
        )}
        {selectedOptionName === DailyLogFilterTabTypes.CUSTOM_RANGE && (
          <Typography fontSize={"1.25rem"} fontWeight={"600"}>
            {selectedDates[0] &&
              convertDateToFormat(selectedDates[0], DAY_MONTH_FORMAT)}{" "}
            -{" "}
            {selectedDates[1] &&
              convertDateToFormat(selectedDates[1], DAY_MONTH_YEAR_FORMAT)}
          </Typography>
        )}
        {selectedOptionName !== DailyLogFilterTabTypes.CUSTOM_RANGE &&
          !isForwardButtonHidden() && (
            <IconButton
              icon={
                <Icon
                  name={IconName.CHEVRON_RIGHT_ICON}
                  fill={theme.palette.common.black}
                />
              }
              buttonStyles={classes.iconButtonStyles}
              onClick={() => goForward()}
              ariaLabel={`${translateAria(["nextButton"])} ${selectedOptionName?.toLowerCase()}`}
            />
          )}
      </Stack>
      <ButtonV2
        isFullWidth={false}
        variant={"tertiary"}
        size={"sm"}
        onClick={(event: MouseEvent<HTMLElement>) => {
          setAnchorElDropdown(event.currentTarget);
          setShowOverlayDropdown(!showOverlayDateRange);
        }}
        icon={<Icon name={IconName.DROPDOWN_ARROW_ICON} />}
        iconPosition="end"
      >
        {selectedOptionName}
      </ButtonV2>
      <Popper
        anchorEl={anchorElDropdown}
        open={Boolean(showOverlayDropdown)}
        position={"bottom-end"}
        handleClose={() => closeDropdownMenu()}
        menuType={MenuTypes.SELECT}
        disablePortal={true}
        id="popper"
        isFlip={true}
        timeout={300}
        containerStyles={classes.popperContainerStyles}
      >
        <Box sx={classes.sortContainer}>
          <SortRow
            text={translateText(["weekOptionText"])}
            selected={selectedOptionName === DailyLogFilterTabTypes.WEEK}
            onClick={() => {
              setSelectedOptionName(DailyLogFilterTabTypes.WEEK);
              closeDropdownMenu();
            }}
          />
          <SortRow
            text={translateText(["monthOptionText"])}
            selected={selectedOptionName === DailyLogFilterTabTypes.MONTH}
            onClick={() => {
              setSelectedOptionName(DailyLogFilterTabTypes.MONTH);
              closeDropdownMenu();
            }}
          />
          <SortRow
            text={translateText(["customOptionText"])}
            selected={
              selectedOptionName === DailyLogFilterTabTypes.CUSTOM_RANGE
            }
            onClick={() => {
              setSelectedOptionName(DailyLogFilterTabTypes.CUSTOM_RANGE);
              closeDropdownMenu();
              setShowOverlayDateRange(true);
            }}
          />
        </Box>
      </Popper>
      <Popper
        anchorEl={anchorElDropdown}
        open={Boolean(showOverlayDateRange)}
        position={"bottom-end"}
        handleClose={() => closeDateRangeMenu()}
        menuType={MenuTypes.DEFAULT}
        disablePortal={true}
        id="popper"
        isFlip={true}
        timeout={300}
        containerStyles={classes.popperDateContainerStyles}
      >
        <Box sx={classes.sortContainer}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <StaticDatePicker
              displayStaticWrapperAs={"desktop"}
              value={
                selectedDates.length > 0
                  ? DateTime.fromJSDate(
                      new Date(selectedDates[selectedDates.length - 1])
                    )
                  : DateTime.now()
              }
              slots={{
                day: CustomPickerDay
              }}
              slotProps={{
                leftArrowIcon: {
                  sx: {
                    "&.Mui-disabled": {
                      visibility: "hidden"
                    }
                  }
                },
                rightArrowIcon: {
                  sx: {
                    "&.Mui-disabled": {
                      visibility: "hidden"
                    }
                  }
                }
              }}
              onChange={handleDateChange}
              maxDate={DateTime.now()}
              minDate={firstDateOfYear}
            />
          </LocalizationProvider>
        </Box>
      </Popper>
    </Stack>
  );
};

export default TimesheetDailyLogFilter;
