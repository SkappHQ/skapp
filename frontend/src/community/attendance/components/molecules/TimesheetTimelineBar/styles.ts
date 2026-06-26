import { colorSelector } from "~community/attendance/constants/constants";
import { TimeSlotsType } from "~community/attendance/types/timeSheetTypes";

const styles = () => ({
  initialPercentageBoxStyles: (initialPercentage: number) => ({
    width: initialPercentage?.toString() + "%",
    height: "1rem",
    bgcolor: "",
    borderRadius: "0.25rem"
  }),
  percentageBoxStyles: (percentage: number, entry: TimeSlotsType) => ({
    width: percentage.toString() + "%",
    height: "1rem",
    mr: "0.005rem",
    bgcolor: entry?.isManualEntry
      ? colorSelector.MANUAL
      : colorSelector[entry?.slotType],
    borderRadius: "0.25rem"
  }),
  stackContainerStyles: (getWidth: () => string) => ({
    width: getWidth(),
    my: "1rem",
    mx: "2rem",
    height: "2rem"
  })
});

export default styles;
