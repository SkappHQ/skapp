import {
  Box,
  CircularProgress,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { FC, useCallback } from "react";

import { useGetPeriodAvailabilityMutation } from "~community/attendance/api/AttendanceEmployeeApi";
import {
  DAY_END_TIME,
  DAY_START_TIME,
  WEEKDAY_DAY_MONTH_YEAR_FORMAT,
  durationSelector,
  holidayDurationSelector
} from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  DailyLogType,
  TimeAvailabilityType
} from "~community/attendance/types/timeSheetTypes";
import { formatDuration, isToday } from "~community/attendance/utils/TimeUtils";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import {
  getTabIndex,
  shouldActivateButton,
  shouldMoveDownward,
  shouldMoveUpward
} from "~community/common/utils/keyboardUtils";

import TimesheetTimelineBar from "../TimesheetTimelineBar/TimesheetTimelineBar";
import styles from "./styles";

interface Props {
  record: DailyLogType;
  headerLength: number;
}

const TimesheetDailyRecordTableRow: FC<Props> = ({ record, headerLength }) => {
  const { isFreeTier } = useSessionData();

  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const translateAria = useTranslator(
    "attendanceAria",
    "timesheet",
    "dailyLogTable"
  );
  const classes = styles(theme);
  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  const {
    attendanceParams,
    setSelectedDailyRecord,
    setIsEmployeeTimesheetModalOpen,
    setEmployeeTimesheetModalType
  } = useAttendanceStore((state) => state);
  const status = attendanceParams.slotType;

  const handleEdit = useCallback(() => {
    setSelectedDailyRecord(record);
    if (
      !record?.timeRecordId &&
      (record.leaveRequest || record?.holiday) &&
      !record.timeSlots.length
    ) {
      setIsEmployeeTimesheetModalOpen(true);
      setEmployeeTimesheetModalType(
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY
      );
    } else if (
      record?.timeRecordId &&
      (record.leaveRequest || record?.holiday) &&
      record.timeSlots.length
    ) {
      setIsEmployeeTimesheetModalOpen(true);
      setEmployeeTimesheetModalType(
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
      );
    } else if (
      record?.timeRecordId &&
      !record.leaveRequest &&
      record.timeSlots.length
    ) {
      setIsEmployeeTimesheetModalOpen(true);
      setEmployeeTimesheetModalType(
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY
      );
    } else if (
      !record?.timeRecordId &&
      !record.leaveRequest &&
      !record.timeSlots.length
    ) {
      setIsEmployeeTimesheetModalOpen(true);
      setEmployeeTimesheetModalType(
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
      );
    }
  }, [
    record,
    setIsEmployeeTimesheetModalOpen,
    setSelectedDailyRecord,
    setEmployeeTimesheetModalType
  ]);

  const getLeaveLength = (leaveState: string) => {
    if (leaveState === LeaveStates.FULL_DAY) {
      return translateText(["fullDayTitle"]);
    } else {
      return translateText(["halfDayTitle"]);
    }
  };

  const LeaveEmoji = (
    leaveType: string,
    emoji: string,
    isHoliday?: boolean
  ) => {
    return (
      <Tooltip
        title={`${getEmoji(emoji)}  ${
          isHoliday ? "Holiday" : getLeaveLength(leaveType)
        }`}
        maxWidth="max-content"
        placement={TooltipPlacement.BOTTOM}
      >
        <Box sx={classes.boxLeaveEmojiStyle}>
          <CircularProgress
            sx={classes.circularProgressLeaveEmojiStyle(leaveType)}
            size="1.4rem"
            thickness={2}
            variant="determinate"
            value={
              leaveType === LeaveStates.MORNING ||
              leaveType === LeaveStates.EVENING
                ? 50
                : 100
            }
            aria-label={
              isHoliday
                ? `${holidayDurationSelector[leaveType]} ${translateAria(["holiday"])}`
                : `${durationSelector[leaveType]} ${translateAria(["leave"])}`
            }
          />
          <Typography fontSize={10}>{getEmoji(emoji)}</Typography>
        </Box>
      </Tooltip>
    );
  };

  const handleAvailability = (
    timeAvailabilityForPeriod: TimeAvailabilityType
  ) => {
    if (timeAvailabilityForPeriod) {
      if (
        (status === AttendanceSlotType.START ||
          status === AttendanceSlotType.PAUSE ||
          status === AttendanceSlotType.RESUME) &&
        isToday(record?.date)
      ) {
        setIsEmployeeTimesheetModalOpen(true);
        setEmployeeTimesheetModalType(
          EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY_BY_EDIT
        );
      } else if (
        timeAvailabilityForPeriod?.editTimeRequests ||
        timeAvailabilityForPeriod?.manualEntryRequests?.length
      ) {
        setIsEmployeeTimesheetModalOpen(true);
        setEmployeeTimesheetModalType(
          EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS_BY_EDIT
        );
      } else {
        handleEdit();
      }
    }
  };

  const { mutate } = useGetPeriodAvailabilityMutation(
    record?.date,
    DAY_START_TIME,
    DAY_END_TIME,
    handleAvailability
  );

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={classes.stackContainerStyle}
      onClick={() => mutate()}
      tabIndex={getTabIndex(isFreeTier)}
      onKeyDown={(e) => {
        if (shouldActivateButton(e.key)) {
          mutate();
        }
        if (shouldMoveUpward(e.key)) {
          const previousRow = e.currentTarget
            .previousElementSibling as HTMLElement;
          if (previousRow) {
            previousRow.focus();
          }
        }
        if (shouldMoveDownward(e.key)) {
          const nextRow = e.currentTarget.nextElementSibling as HTMLElement;
          if (nextRow) {
            nextRow.focus();
          }
        }
      }}
    >
      <Box sx={classes.boxContainerStyle(isDrawerToggled)}>
        <Typography variant="body2" sx={classes.dateFontStyle}>
          {convertDateToFormat(
            new Date(record?.date),
            WEEKDAY_DAY_MONTH_YEAR_FORMAT
          )}
        </Typography>
        <Typography variant="body2" sx={classes.workedHoursFontStyle}>
          {formatDuration(record?.workedHours)}{" "}
          {!!record.leaveRequest &&
            LeaveEmoji(
              record.leaveRequest.leaveState,
              record.leaveRequest.leaveType.emojiCode,
              false
            )}
          {!!record.holiday &&
            LeaveEmoji(record.holiday.holidayDuration, "1f3d6-fe0f", true)}
        </Typography>
      </Box>
      <TimesheetTimelineBar
        key={record?.date}
        record={record}
        headerLength={headerLength}
      />
    </Stack>
  );
};

export default TimesheetDailyRecordTableRow;
