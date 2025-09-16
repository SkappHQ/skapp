import {
  ClickAwayListener,
  Paper,
  Popper,
  type SxProps,
  Typography
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import {
  Dispatch,
  FC,
  KeyboardEvent,
  MouseEvent,
  SetStateAction,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import PickersDay from "~community/common/components/molecules/DateRangePickersDay/DateRangePickersDay";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import {
  getChipLabel,
  handleDateChange
} from "~community/common/utils/dateRangePickerUtils";
import {
  shouldCollapseDropdown,
  shouldExpandDropdown
} from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props {
  startDate?: Date;
  endDate?: Date;
  minDate?: Date;
  label: string;
  componentStyle?: SxProps;
  placeholder: string | undefined;
  popperStyles?: SxProps;
  selectedDates: Date[];
  setSelectedDates: Dispatch<SetStateAction<Date[]>>;
  tabIndex?: number;
  isRangePicker?: boolean; // Add this prop to toggle between single and range
  accessibility?: {
    ariaLabel?: string;
  };
}

const InputDateRange: FC<Props> = ({
  startDate,
  endDate,
  minDate,
  label,
  componentStyle,
  placeholder,
  popperStyles,
  accessibility,
  selectedDates,
  setSelectedDates,
  tabIndex = 0,
  isRangePicker = true
}) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateAria = useTranslator("commonAria", "components", "inputDate");

  const lowerCaseLabel = label.toLowerCase();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open: boolean = Boolean(anchorEl);

  const dateRangeText = getChipLabel({
    selectedDates,
    isRangePicker,
    startDate,
    endDate
  });

  const handleClick = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLDivElement>
  ): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...componentStyle
      }}
    >
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
          border: "none"
        }}
      >
        <Typography
          sx={{
            color:
              selectedDates.length > 0
                ? theme.palette.common.black
                : theme.palette.grey[700],
            opacity: 1
          }}
        >
          {selectedDates.length > 0 ? dateRangeText : placeholder}
        </Typography>

        <Box
          role="button"
          tabIndex={0}
          aria-label={
            accessibility?.ariaLabel
              ? accessibility?.ariaLabel
              : translateAria(["calendarIcon"], {
                  name: lowerCaseLabel
                })
          }
          onClick={(e: MouseEvent<HTMLElement>) => handleClick(e)}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (shouldExpandDropdown(e.key)) {
              e.preventDefault();
              handleClick(e);
            }
            if (shouldCollapseDropdown(e.key)) handleClose();
          }}
        >
          <Icon name={IconName.CALENDAR_ICON} fill={theme.palette.grey[700]} />
        </Box>

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
    </Box>
  );
};
export default InputDateRange;
