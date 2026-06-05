import { Box, Stack, Typography, useTheme } from "@mui/material";
import { JSX, useCallback, useEffect, useState } from "react";

import PlayButton from "~community/attendance/components/molecules/PlayButton/PlayButton";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { calculateWorkedDuration } from "~community/attendance/utils/CalculateWorkedDuration";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";

import styles from "./styles";

interface TimerProps {
  disabled: boolean;
}

const Timer = ({ disabled }: TimerProps): JSX.Element => {
  const { attendanceParams, isAttendanceModalOpen, setIsAttendanceModalOpen } =
    useAttendanceStore((state) => state);
  const theme = useTheme();
  const classes = styles(theme);
  const status = attendanceParams.slotType;
  const [timer, setTimer] = useState(calculateWorkedDuration(attendanceParams));

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);
  const translateText = useTranslator("attendanceModule", "timeWidget");

  const handleClockOut = useCallback(() => {
    setIsAttendanceModalOpen(true);
  }, [setIsAttendanceModalOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    setTimer(calculateWorkedDuration(attendanceParams));

    if (
      (status === AttendanceSlotType.RESUME ||
        status === AttendanceSlotType.START) &&
      !isAttendanceModalOpen
    ) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (status === AttendanceSlotType.END) {
      setTimer(0);
    } else {
      interval && clearInterval(interval);
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [status, attendanceParams, isAttendanceModalOpen]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      component="div"
      sx={status && classes.container(status)}
    >
      <Box
        key={timer}
        sx={status && classes.timerComponent(status, isAttendanceModalOpen)}
      />
      {/* timer */}
      {!isBelow600 && (
        <Typography
          variant="h3"
          component="p"
          sx={classes.textStyle(disabled)}
          minWidth={68}
        >
          {timer
            ? new Date(timer * 1000).toISOString().substring(11, 19)
            : "00:00:00"}
        </Typography>
      )}
      <PlayButton />
      <Tooltip
        title={translateText(["clockOut"])}
        placement={TooltipPlacement.BOTTOM}
      >
        <button
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-semantic-red-accent hover:opacity-50"
          onClick={handleClockOut}
          aria-label={translateText(["clockOut"])}
        >
          <div className="h-2 w-2 rounded-[1px] bg-white" />
        </button>
      </Tooltip>
    </Stack>
  );
};

export default Timer;
