import { leaveDurationTypes } from "~community/attendance/types/attendanceTypes";
import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";

export const getLeaveDuration = (leaveTypeName: string): string => {
  switch (leaveTypeName) {
    case leaveDurationTypes.FULL_DAY:
      return "Full Day";
    case leaveDurationTypes.HALF_DAY_MORNING:
      return "Half Day - Morning";
    case leaveDurationTypes.HALF_DAY_EVENING:
      return "Half Day - Evening";
    default:
      return leaveTypeName;
  }
};

const isMorning = (
  hour: number,
  timeConfigData?: DefaultDayCapacityType
): boolean => {
  if (!timeConfigData) return false;
  const { startTime, totalHours } = timeConfigData;
  const startHour = startTime ? parseInt(startTime.split(":")[0]) : 0;
  const midHour = startHour + totalHours / 2;
  return hour < midHour;
};

export const isLeaveApplicable = (
  duration: string,
  currentHour: number,
  timeConfigData: DefaultDayCapacityType
): boolean => {
  const isFullDay = duration === "Full Day";
  const isMorningHalfDay = duration === "Half Day - Morning";
  return (
    isFullDay ||
    (isMorningHalfDay
      ? isMorning(currentHour, timeConfigData)
      : !isMorning(currentHour, timeConfigData))
  );
};
