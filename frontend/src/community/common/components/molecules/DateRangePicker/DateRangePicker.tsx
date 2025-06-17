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

import Icon from "~community/common/components/atoms/Icon/Icon";
import PickersDay from "~community/common/components/molecules/DateRangePickersDay/DateRangePickersDay";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import {
  getChipLabel,
  handleDateChange
} from "~community/common/utils/dateRangePickerUtils";
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

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open: boolean = Boolean(anchorEl);

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
          label={getChipLabel({
            selectedDates,
            isRangePicker,
            startDate,
            endDate
          })}
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
                ? `Selected date ${DateTime.fromJSDate(selectedDates[0]).toFormat("dd MMMM yyyy")}. Press enter to change selected date`
                : "Press enter to select date"
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
