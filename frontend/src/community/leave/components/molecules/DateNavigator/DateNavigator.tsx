import { Stack } from "@mui/material";
import { DateTime } from "luxon";

import { FilledArrow } from "~community/common/components/atoms/FilledArrow/FilledArrow";
import { useTranslator } from "~community/common/hooks/useTranslator";

const navigateDate = (
  currentStartDate: string,
  currentEndDate: string,
  weeks: number,
  setStartDate: (date: string) => void,
  setEndDate: (date: string) => void,
  dateFormat: string
) => {
  setStartDate(
    DateTime.fromFormat(currentStartDate, dateFormat)
      .plus({ weeks })
      .toFormat(dateFormat)
  );

  setEndDate(
    DateTime.fromFormat(currentEndDate, dateFormat)
      .plus({ weeks })
      .toFormat(dateFormat)
  );
};

const DateNavigator = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  navigateWeeks,
  dateFormat
}: {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  navigateWeeks: number;
  dateFormat: string;
}) => {
  const translateAria = useTranslator("leaveAria", "dashboard");

  const handleNavigate = (direction: "forward" | "backward") => {
    const weeks = direction === "forward" ? navigateWeeks : -navigateWeeks;
    navigateDate(
      startDate,
      endDate,
      weeks,
      setStartDate,
      setEndDate,
      dateFormat
    );
  };

  return (
    <Stack direction="row" gap={"0.25rem"} mt={1} justifyContent={"end"}>
      <FilledArrow
        onClick={() => handleNavigate("backward")}
        isRightArrow={false}
        backgroundColor={"grey.100"}
        ariaLabel={translateAria(["resourceAvailabilityTrendMonthlyPrevious"])}
      />
      <FilledArrow
        onClick={() => handleNavigate("forward")}
        isRightArrow={true}
        backgroundColor={"grey.100"}
        ariaLabel={translateAria(["resourceAvailabilityTrendMonthlyNext"])}
      />
    </Stack>
  );
};

export default DateNavigator;
