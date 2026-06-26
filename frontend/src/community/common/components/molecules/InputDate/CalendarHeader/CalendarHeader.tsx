import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { PickersCalendarHeaderProps } from "@mui/x-date-pickers";
import { DateTime } from "luxon";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

const CalendarHeader = (props: PickersCalendarHeaderProps<DateTime>) => {
  const theme: Theme = useTheme();
  const classes = styles();

  return (
    <Stack sx={classes.wrapper}>
      <Typography>{props.currentMonth.toFormat("MMMM")}</Typography>
      <Stack sx={classes.iconWrapper}>
        <Box
          sx={classes.iconContainer}
          onClick={() => {
            if (props.currentMonth.month !== 1) {
              props.onMonthChange(
                props.currentMonth.minus({ months: 1 }),
                "left"
              );
            }
          }}
        >
          <Icon
            name={IconName.CHEVRON_LEFT_ICON}
            width="1rem"
            height="1rem"
            fill={
              props.currentMonth.month === 1
                ? theme.palette.grey[500]
                : theme.palette.common.black
            }
          />
        </Box>
        <Box
          sx={classes.iconContainer}
          onClick={() => {
            if (props.currentMonth.month !== 12) {
              props.onMonthChange(
                props.currentMonth.plus({ months: 1 }),
                "right"
              );
            }
          }}
        >
          <Icon
            name={IconName.CHEVRON_RIGHT_ICON}
            width="1rem"
            height="1rem"
            fill={
              props.currentMonth.month === 12
                ? theme.palette.grey[500]
                : theme.palette.common.black
            }
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default CalendarHeader;
