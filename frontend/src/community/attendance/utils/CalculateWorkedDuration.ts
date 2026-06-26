import {
  AttendanceSlotType,
  attendanceStatusTypes
} from "~community/attendance/types/attendanceTypes";

export const calculateWorkedDuration = (
  attendanceParams: attendanceStatusTypes
): number => {
  const { slotType, slotStartTime, workHours } = attendanceParams;

  if (
    slotType === AttendanceSlotType.START ||
    slotType === AttendanceSlotType.RESUME ||
    slotType === AttendanceSlotType.END
  ) {
    const startTime = new Date(slotStartTime + "Z");
    const currentTime = new Date();
    const diff = currentTime.getTime() - startTime.getTime();
    const workHoursInMilliseconds =
      workHours !== null ? workHours * 60 * 60 * 1000 : 0;
    const totalWorkedMilliseconds = workHoursInMilliseconds + diff;

    return Math.floor(totalWorkedMilliseconds / 1000);
  } else if (slotType === AttendanceSlotType.PAUSE) {
    const workHoursInMilliseconds =
      workHours !== null ? workHours * 60 * 60 * 1000 : 0;

    return Math.floor(workHoursInMilliseconds / 1000);
  } else {
    return 0;
  }
};

export const calculateWorkedDurationInHoursAndMinutes = (
  durationInSeconds: number
): string => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};
