import { Box, Stack } from "@mui/material";
import { DateTime } from "luxon";
import { JSX, useEffect, useState } from "react";

import {
  DailyLogType,
  TimeSlotsType
} from "~community/attendance/types/timeSheetTypes";
import {
  getDayStartTimeEndTime,
  getTimeDifference,
  sortTimeSlots,
  timeStringToSeconds
} from "~community/attendance/utils/TimeUtils";

import styles from "./styles";

interface Props {
  record: DailyLogType;
  headerLength: number;
}

const TimesheetTimelineBar = ({ record, headerLength }: Props): JSX.Element => {
  const { dayStart, dayEnd } = getDayStartTimeEndTime();
  const [dayTimeSeconds, setDayTimeSeconds] = useState<number>(1);
  const sortedTimeSlots = sortTimeSlots(record?.timeSlots);
  const classes = styles();

  const getBar = (entry: TimeSlotsType, index: number) => {
    let initialPercentage = 0;
    const percentage =
      (getTimeDifference(entry?.startTime, entry?.endTime) / dayTimeSeconds) *
      100;

    if (index === 0) {
      initialPercentage =
        (getTimeDifference(dayStart, entry?.startTime) / dayTimeSeconds) * 100;
    } else {
      initialPercentage =
        (getTimeDifference(
          record?.timeSlots[index - 1]?.endTime,
          entry?.startTime
        ) /
          dayTimeSeconds) *
        100;
    }
    return (
      <>
        {!!initialPercentage && (
          <Box
            sx={classes.initialPercentageBoxStyles(initialPercentage)}
            key={entry?.timeSlotId + "start"}
          />
        )}
        <Box
          sx={classes.percentageBoxStyles(percentage, entry)}
          key={entry?.timeSlotId}
        />
      </>
    );
  };

  const getWidth = () => {
    const width = (headerLength - 1) * 4;
    return width.toString() + "rem";
  };

  useEffect(() => {
    const startSeconds = timeStringToSeconds(
      DateTime.fromISO(dayStart).toFormat("HH:mm")
    );
    const endSeconds = timeStringToSeconds(
      DateTime.fromISO(dayEnd).toFormat("HH:mm")
    );
    setDayTimeSeconds(endSeconds - startSeconds);
  }, [dayEnd, dayStart]);

  return (
    <Stack
      sx={classes.stackContainerStyles(getWidth)}
      direction={"row"}
      alignItems={"center"}
      justifyItems={"flex-start"}
    >
      {sortedTimeSlots.map((entry, index) => getBar(entry, index))}
    </Stack>
  );
};

export default TimesheetTimelineBar;
