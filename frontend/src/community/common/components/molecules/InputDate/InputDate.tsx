import { PopperPlacementType } from "@mui/base";
import {
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  type SxProps,
  Typography
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import {
  LocalizationProvider,
  PickersCalendarHeader,
  PickersDay,
  PickersDayProps,
  StaticDatePicker
} from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import {
  Dispatch,
  FC,
  KeyboardEvent,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { REVERSE_DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import {
  shouldCollapseDropdown,
  shouldExpandDropdown
} from "~community/common/utils/keyboardUtils";
import { LeaveState } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  HolidayDataResponse,
  HolidayType,
  addedHolidays
} from "~community/people/types/HolidayTypes";

import CalendarHeader from "./CalendarHeader/CalendarHeader";
import styles from "./styles";

interface Props {
  addedHolidays?: addedHolidays[];
  minDate?: DateTime;
  maxDate?: DateTime;
  onchange: (newValue: string) => void;
  error?: string;
  inputStyle?: SxProps;
  tooltipStyles?: SxProps;
  label: string;
  componentStyle?: SxProps;
  readOnly?: boolean;
  isWithLeaves?: boolean;
  isOnlyWorkingDays?: boolean;
  isWithHolidays?: boolean;
  placeholder: string | undefined;
  tooltip?: string;
  inputFormat?: string;
  required?: boolean;
  disableMaskedInput?: boolean;
  defaultCalendarMonth?: DateTime;
  disabled?: boolean;
  isEditable?: boolean;
  isPreviousHolidayDisabled?: boolean;
  holidays?: HolidayDataResponse | undefined;
  placeHolder?: string;
  name?: string;
  popperStyles?: SxProps;
  selectedDate: DateTime | undefined;
  setSelectedDate: Dispatch<SetStateAction<DateTime | undefined>>;
  isYearHidden?: boolean;
  myLeaveRequests?: MyLeaveRequestPayloadType[];
  initialMonthlyView?: DateTime | undefined;
  accessibility?: {
    ariaLabel?: string;
  };
}

const InputDate: FC<Props> = ({
  minDate,
  maxDate,
  onchange,
  tooltipStyles,
  tooltip,
  error,
  label,
  componentStyle,
  required = false,
  disabled = false,
  holidays,
  placeholder,
  popperStyles,
  selectedDate,
  setSelectedDate,
  inputFormat,
  isYearHidden,
  readOnly = false,
  myLeaveRequests,
  initialMonthlyView,
  accessibility
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator("commonAria", "components", "inputDate");

  const lowerCaseLabel = label.toLowerCase();

  const [alreadyAppliedHolidays, setAlreadyAppliedHolidays] = useState<
    HolidayType[]
  >([]);
  const [leaveRequests, setLeaveRequests] = useState<
    { date: string; leaveStates: string }[]
  >([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<PopperPlacementType>("bottom"); // TODO: Use enums
  const open: boolean = Boolean(anchorEl);

  useEffect(() => {
    if (holidays) {
      const appliedHolidays = holidays?.pages[0]?.items?.map(
        // TODO: fix type issue
        (item: HolidayType) => ({
          date: item.date,
          name: item.name,
          holidayType: item.holidayDuration || undefined
        })
      );
      setAlreadyAppliedHolidays(appliedHolidays);
    }

    if (myLeaveRequests) {
      const appliedLeaves = myLeaveRequests?.map((leave) => ({
        date: leave.startDate,
        leaveStates: leave.leaveState
      }));
      setLeaveRequests(appliedLeaves);
    }
  }, [holidays, myLeaveRequests]);

  // TODO: Move the isHoliday function to a separate file and write tests for it
  const isHoliday = (day: DateTime) => {
    return alreadyAppliedHolidays?.find((holiday) => {
      const holidayDate = DateTime.fromISO(holiday?.date);
      if (!holidayDate.isValid) {
        return false;
      }

      return holidayDate.hasSame(day, "day");
    });
  };

  const isLeave = (day: DateTime) => {
    return leaveRequests?.find((leave) => {
      const leaveDate = DateTime.fromISO(leave?.date);
      if (!leaveDate.isValid) {
        return false;
      }
      return leaveDate.hasSame(day, "day");
    });
  };

  // TODO: Move the HolidayPickersDay to a separate file and fix the type issues
  const HolidayPickersDay = (props: PickersDayProps<DateTime>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    let backgroundStyle = {};

    const appliedHoliday = alreadyAppliedHolidays && isHoliday(day);
    const appliedLeave = leaveRequests && isLeave(day);

    if (appliedHoliday) {
      if (appliedHoliday?.holidayDuration === "FULL_DAY") {
        backgroundStyle = {
          backgroundColor: theme.palette.grey[200]
        };
      } else if (appliedHoliday.holidayDuration === "HALF_DAY_MORNING") {
        backgroundStyle = {
          background: `linear-gradient(90deg, ${theme.palette.grey[200]} 50%, transparent 50%)`
        };
      } else if (appliedHoliday.holidayDuration === "HALF_DAY_EVENING") {
        backgroundStyle = {
          background: `linear-gradient(90deg, transparent 50%, ${theme.palette.grey[200]} 50%)`
        };
      }
    }

    if (appliedLeave) {
      if (appliedLeave.leaveStates === LeaveState.FULL_DAY) {
        backgroundStyle = { ...classes.fullDayLeave };
      } else if (appliedLeave.leaveStates === LeaveState.HALF_DAY_MORNING) {
        backgroundStyle = { ...classes.halfDayMorningLeave };
      } else if (appliedLeave.leaveStates === LeaveState.HALF_DAY_EVENING) {
        backgroundStyle = {
          ...classes.halfDayEveningLeave
        };
      }
    }

    return (
      <Box
        style={{
          borderRadius: "50%"
        }}
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          sx={{
            ...backgroundStyle
          }}
        />
      </Box>
    );
  };

  const calculatePlacement = useCallback(
    (currentTarget: HTMLElement | null) => {
      if (!currentTarget) return;

      const targetRect = currentTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const bottomSpace = viewportHeight - targetRect.bottom;
      const topSpace = targetRect.top;

      setPlacement(
        bottomSpace < 300 && bottomSpace < topSpace ? "top" : "bottom" // TODO: Use enums
      );
    },
    []
  );

  const handleClick = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLDivElement>
  ): void => {
    calculatePlacement(event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleDateChange = (date: DateTime | null) => {
    if (!date) return;
    setSelectedDate(date);
    onchange(date ? date.toISO() || "" : "");
  };

  const onAccept = (date: DateTime | null) => {
    if (date) handleClose();
  };

  return (
    // TODO: Move the styles to the styles file, and remove the inline styles except for the styles that are dynamic
    // TODO: Use Stack instead of Box when display is flex
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...componentStyle
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={mergeSx([classes.labelWrapper, tooltipStyles])}
      >
        <Typography
          component="label"
          lineHeight={1.5}
          sx={{
            fontWeight: 400,
            color: disabled
              ? theme.palette.grey[700]
              : error
                ? theme.palette.error.contrastText
                : theme.palette.common.black
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.palette.error.contrastText }}>*</span>
          )}
        </Typography>
        {tooltip && (
          <Tooltip
            id="emoji-field"
            title={tooltip}
            isDisabled={disabled}
            aria-label={`${lowerCaseLabel} ${translateAria(["ariaLabel"])}`}
          />
        )}
      </Stack>

      <Box
        sx={{
          bgcolor: "grey.100",
          mt: "0.5rem",
          height: "3rem",
          borderRadius: "0.5rem",
          overflow: "hidden",
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          alignItems: "center",
          border: error
            ? `${theme.palette.error.contrastText} 0.0625rem solid`
            : "none"
        }}
      >
        <Typography
          sx={{
            color: readOnly
              ? "text.secondary"
              : selectedDate
                ? theme.palette.common.black
                : theme.palette.text.secondary,
            opacity: 1
          }}
        >
          {selectedDate
            ? convertDateToFormat(
                selectedDate.toJSDate(),
                inputFormat ? inputFormat : REVERSE_DATE_FORMAT
              )
            : placeholder}
        </Typography>
        {!readOnly && (
          <Box
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={
              accessibility?.ariaLabel
                ? accessibility?.ariaLabel
                : translateAria(["calendarIcon"], {
                    name: lowerCaseLabel
                  })
            }
            onClick={(e: MouseEvent<HTMLElement>) =>
              !(disabled || readOnly) && handleClick(e)
            }
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (shouldExpandDropdown(e.key)) {
                e.preventDefault();
                !(disabled || readOnly) && handleClick(e);
              }
              if (shouldCollapseDropdown(e.key))
                !(disabled || readOnly) && handleClose();
            }}
          >
            <Icon
              name={IconName.CALENDAR_ICON}
              fill={
                readOnly
                  ? theme.palette.grey[700]
                  : disabled
                    ? theme.palette.grey[600]
                    : "black"
              }
            />
          </Box>
        )}
      </Box>

      <Popper
        id="custom-date-picker"
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        disablePortal
        sx={mergeSx([classes.popper, popperStyles])}
        tabIndex={0}
        aria-hidden={true}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (shouldCollapseDropdown(e.key))
            !(disabled || readOnly) && handleClose();
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={selectedDate}
                slots={{
                  day: HolidayPickersDay,
                  calendarHeader: isYearHidden
                    ? CalendarHeader
                    : PickersCalendarHeader
                }}
                slotProps={{
                  yearButton: {
                    sx: {
                      "&.Mui-selected": {
                        color: "common.white"
                      }
                    }
                  },
                  monthButton: {
                    sx: {
                      "&.Mui-selected": {
                        color: "common.white"
                      }
                    }
                  },
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
                views={["year", "month", "day"]}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate}
                onAccept={(e) => onAccept(e)}
                referenceDate={initialMonthlyView}
              />
            </LocalizationProvider>
          </Paper>
        </ClickAwayListener>
      </Popper>

      {!!error && (
        <Typography
          variant="body2"
          role="alert"
          aria-live="assertive"
          sx={mergeSx([
            classes.errorText,
            { color: theme.palette.error.contrastText }
          ])}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};
export default InputDate;
