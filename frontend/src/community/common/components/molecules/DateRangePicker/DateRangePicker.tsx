import {
  Box,
  Chip,
  ClickAwayListener,
  Paper,
  Popper,
  Stack,
  type SxProps,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import {
  Dispatch,
  FC,
  KeyboardEvent,
  type MouseEvent,
  SetStateAction,
  useState
} from "react";

import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import Icon from "~community/common/components/atoms/Icon/Icon";
import PickersDay from "~community/common/components/molecules/DateRangePickersDay/DateRangePickersDay";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import {
  getChipLabel,
  handleDateChange
} from "~community/common/utils/dateRangePickerUtils";
import { getLocaleDateString } from "~community/common/utils/dateTimeUtils";
import { shouldCollapseDropdown } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props {
  label?: string;
  selectedDates: Date[];
  setSelectedDates: Dispatch<SetStateAction<Date[]>>;
  popperStyles?: SxProps;
  startDate?: Date;
  endDate?: Date;
  minDate?: Date;
  isRangePicker?: boolean; // Add this prop to toggle between single and range
  chipStyles?: SxProps;
  tabIndex?: number;
  hasBorder?: boolean;
  accessibility?: {
    ariaLabel?: string;
  };
}

const DateRangePicker: FC<Props> = ({
  label,
  selectedDates,
  setSelectedDates,
  popperStyles,
  startDate,
  endDate,
  minDate,
  isRangePicker = true, // Default to range picker
  chipStyles,
  tabIndex = 0,
  hasBorder = false,
  accessibility
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator("commonAria", "dateRangePicker");

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open: boolean = Boolean(anchorEl);

  const chipLabel = getChipLabel({
    selectedDates,
    isRangePicker,
    startDate,
    endDate
  });

  const currentYear = new Date().getFullYear();
  const startDateOfYear = new Date(currentYear, 0, 1); // Jan 1
  const endDateOfYear = new Date(currentYear, 11, 31); // Dec 31

  return (
    <Stack sx={classes.wrapper}>
      {label && <Typography variant="body2">{label}</Typography>}
      <Box>
        <Chip
          icon={
            <Box sx={classes.iconWrapper}>
              <Icon name={IconName.CALENDAR_ICON} />
            </Box>
          }
          onClick={(event: MouseEvent<HTMLElement>) =>
            setAnchorEl(event.currentTarget)
          }
          label={chipLabel}
          sx={mergeSx([
            classes.chip,
            {
              border: hasBorder
                ? `1px solid ${theme.palette.grey[300]}`
                : "none"
            },
            chipStyles
          ])}
          aria-label={
            accessibility?.ariaLabel
              ? accessibility.ariaLabel
              : selectedDates[0]
                ? translateAria(["selectedDateLabel"], {
                    startDate: DateTime.fromJSDate(selectedDates[0]).toFormat(
                      DAY_MONTH_YEAR_FORMAT
                    ),
                    endDate: DateTime.fromJSDate(selectedDates[1]).toFormat(
                      DAY_MONTH_YEAR_FORMAT
                    )
                  })
                : translateAria(["noSelectedDateLabel"], {
                    startDate: getLocaleDateString(startDateOfYear),
                    endDate: getLocaleDateString(endDateOfYear)
                  })
          }
          tabIndex={tabIndex}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (shouldCollapseDropdown(e.key)) setAnchorEl(null);
          }}
        />

        <Popper
          id="custom-date-picker"
          open={open}
          anchorEl={anchorEl}
          placement="bottom"
          disablePortal
          sx={mergeSx([classes.popper, popperStyles])}
          modifiers={[
            {
              name: "flip",
              enabled: false,
              options: {
                altBoundary: true,
                rootBoundary: "document",
                padding: 8
              }
            }
          ]}
          tabIndex={0}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (shouldCollapseDropdown(e.key)) setAnchorEl(null);
          }}
        >
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Paper>
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={
                    selectedDates.length > 0
                      ? DateTime.fromJSDate(selectedDates[selectedDates.length])
                      : DateTime.now()
                  }
                  slots={{
                    day: (props) =>
                      PickersDay({
                        pickerDaysProps: props,
                        selectedDates,
                        isRangePicker
                      })
                  }}
                  slotProps={{
                    leftArrowIcon: {
                      sx: classes.leftArrowIcon
                    },
                    rightArrowIcon: {
                      sx: classes.rightArrowIcon
                    }
                  }}
                  onChange={(date: DateTime | null) =>
                    handleDateChange({
                      date,
                      isRangePicker,
                      selectedDates,
                      setSelectedDates,
                      setAnchorEl
                    })
                  }
                  minDate={minDate ? DateTime.fromJSDate(minDate) : undefined}
                />
              </LocalizationProvider>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </Stack>
  );
};

export default DateRangePicker;
