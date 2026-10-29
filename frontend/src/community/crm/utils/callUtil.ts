import { Duration } from "luxon";

export const formatCallDuration = (totalMinutes: number): string => {
  const duration = Duration.fromObject({ minutes: totalMinutes }).shiftTo(
    "hours",
    "minutes"
  );

  return duration.hours > 0
    ? duration.toFormat("h'h' m'm'")
    : duration.toFormat("m'm'");
};
