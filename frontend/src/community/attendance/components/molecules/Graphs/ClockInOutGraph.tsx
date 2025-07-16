import { Box, type Theme, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";

import { useClockInOutGraphOptions } from "~community/attendance/utils/echartOptions/clockInOutGraphOptions";
import {
  CLOCK_IN_OUT_CHART_INITIAL_X,
  CLOCK_IN_OUT_CHART_SHIFT_DAYS,
  GRAPH_LEFT,
  GRAPH_RIGHT,
  clockInOutGraphTypes
} from "~community/attendance/utils/echartOptions/constants";
import {
  handleGraphKeyboardNavigation,
  showTooltipAtIndex
} from "~community/attendance/utils/graphKeyboardNavigationUtils";
import ToggleSwitch from "~community/common/components/atoms/ToggleSwitch/ToggleSwitch";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME
} from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { XIndexTypes } from "~community/common/types/CommonTypes";
import { addHours } from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

import ChartNavigationArrows from "../../atoms/ChartNavigationArrows/ChartNavigationArrows";
import TimesheetClockInOutSkeleton from "../Skeletons/TimesheetClockInOutSkeleton";

interface Props {
  error?: Error;
  chartData: {
    preProcessedData: number[];
    labels: string[];
  };
  dataCategory?: string;
  setDataCategory: Dispatch<SetStateAction<string>>;
  isDataLoading?: boolean;
  selectedDate: Date[];
  setSelectedDate: Dispatch<SetStateAction<Date[]>>;
}

const ClockInOutGraph = ({
  error,
  chartData,
  dataCategory,
  setDataCategory,
  isDataLoading,
  selectedDate,
  setSelectedDate
}: Props): JSX.Element => {
  const translations = useTranslator(
    "attendanceModule",
    "teamTimesheetAnalytics"
  );
  const translateTextAria = useTranslator("attendanceAria", "dashboards");

  const theme: Theme = useTheme();
  const { data: timeConfigData } = useDefaultCapacity();

  const clockInOutChartRef = useRef<ReactECharts>(null);

  const standardClockInTime =
    timeConfigData?.[0]?.startTime?.substring(0, 5) ?? DEFAULT_START_TIME;
  const standardClockOutTime =
    (timeConfigData &&
      addHours(standardClockInTime, "HH:mm", timeConfigData[0]?.totalHours)) ??
    DEFAULT_END_TIME;

  const [xIndexDay, setXIndexDay] = useState<XIndexTypes>({
    startIndex:
      chartData?.labels?.findIndex((time) =>
        time.includes(standardClockInTime)
      ) - CLOCK_IN_OUT_CHART_INITIAL_X,
    endIndex:
      chartData?.labels?.findIndex((time) =>
        time.includes(standardClockInTime)
      ) -
      CLOCK_IN_OUT_CHART_INITIAL_X +
      CLOCK_IN_OUT_CHART_SHIFT_DAYS
  });

  const [clockInOutHighlightedIndex, setClockInOutHighlightedIndex] =
    useState<number>(xIndexDay.startIndex);

  // set start and end index around the standard clock in and clock out time
  useEffect(() => {
    const standardTime =
      dataCategory === clockInOutGraphTypes.CLOCKIN.value
        ? standardClockInTime
        : standardClockOutTime;

    const startIndex = findTimeIndex(chartData?.labels, standardTime);
    const endIndex = startIndex + CLOCK_IN_OUT_CHART_SHIFT_DAYS;

    setXIndexDay({
      startIndex,
      endIndex
    });
    setClockInOutHighlightedIndex(startIndex);
  }, [
    chartData?.labels,
    dataCategory,
    standardClockInTime,
    standardClockOutTime
  ]);

  const clockInOutGraphOptions = useClockInOutGraphOptions(
    chartData,
    xIndexDay
  );

  const findTimeIndex = (labels: string[], standardTime: string) => {
    return labels?.findIndex((time: string) => time?.includes(standardTime));
  };

  const handleClick = (direction: string): void => {
    if (direction === GRAPH_LEFT) {
      setXIndexDay((prev) => ({
        startIndex: prev.startIndex - CLOCK_IN_OUT_CHART_SHIFT_DAYS,
        endIndex: prev.endIndex - CLOCK_IN_OUT_CHART_SHIFT_DAYS
      }));
    }
    if (direction === GRAPH_RIGHT) {
      setXIndexDay((prev) => ({
        startIndex: prev.startIndex + CLOCK_IN_OUT_CHART_SHIFT_DAYS,
        endIndex: prev.endIndex + CLOCK_IN_OUT_CHART_SHIFT_DAYS
      }));
    }
  };

  const handleChevronVisibility = (direction: "left" | "right"): string => {
    switch (direction) {
      case GRAPH_LEFT:
        return xIndexDay.startIndex <= 0 ? "hidden" : "visible";

      case GRAPH_RIGHT:
        return xIndexDay.endIndex >= 48 ? "hidden" : "visible";
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0rem",
          gap: "0.125rem",
          width: "100%",
          height: "100%",
          minHeight: "10.9375rem",
          position: "relative"
        }}
      >
        {error ? (
          <Typography>{translations(["error"])}</Typography>
        ) : (
          <>
            <Box
              sx={{
                padding: ".75rem 1.5rem",
                backgroundColor: theme.palette.grey[50],
                borderRadius: ".75rem",
                height: "100%",
                width: "100%"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%"
                }}
              >
                <ToggleSwitch
                  options={[
                    {
                      value: clockInOutGraphTypes.CLOCKIN.label,
                      ariaLabel: translateTextAria(["clockInTrend"])
                    },
                    {
                      value: clockInOutGraphTypes.CLOCKOUT.label,
                      ariaLabel: translateTextAria(["clockOutTrend"])
                    }
                  ]}
                  setCategoryOption={(option: string) => {
                    setDataCategory(
                      option === clockInOutGraphTypes.CLOCKIN.label
                        ? clockInOutGraphTypes.CLOCKIN.value
                        : clockInOutGraphTypes.CLOCKOUT.value
                    );
                  }}
                  categoryOption={
                    dataCategory === clockInOutGraphTypes.CLOCKIN.value
                      ? clockInOutGraphTypes.CLOCKIN.label
                      : clockInOutGraphTypes.CLOCKOUT.label
                  }
                />

                <DateRangePicker
                  selectedDates={selectedDate}
                  setSelectedDates={setSelectedDate}
                  isRangePicker={false}
                />
              </Box>
              {isDataLoading ? (
                <TimesheetClockInOutSkeleton />
              ) : (
                <Box
                  tabIndex={0}
                  role="application"
                  aria-label={translateTextAria(["clockChart"], {
                    type:
                      dataCategory === clockInOutGraphTypes.CLOCKIN.value
                        ? clockInOutGraphTypes.CLOCKIN.label
                        : clockInOutGraphTypes.CLOCKOUT.label
                  })}
                  onKeyDown={(event) =>
                    handleGraphKeyboardNavigation({
                      event,
                      highlightedIndex: clockInOutHighlightedIndex,
                      setHighlightedIndex: setClockInOutHighlightedIndex,
                      chartDataLabels: chartData.labels,
                      xIndexDay,
                      handleClick,
                      chartRef: clockInOutChartRef
                    })
                  }
                  onFocus={() =>
                    showTooltipAtIndex(
                      clockInOutChartRef,
                      clockInOutHighlightedIndex
                    )
                  }
                >
                  <ReactECharts
                    option={clockInOutGraphOptions}
                    style={{ height: "16.25rem" }}
                    ref={clockInOutChartRef}
                  />
                </Box>
              )}
            </Box>
            <ChartNavigationArrows
              tabIndex={0}
              hasData={chartData?.preProcessedData?.length !== 0}
              handleClick={handleClick}
              handleChevronVisibility={handleChevronVisibility}
              leftAriaLabel={translateTextAria(["previousTimeSlots"])}
              rightAriaLabel={translateTextAria(["nextTimeSlots"])}
            />
          </>
        )}
      </Box>
    </>
  );
};

export default ClockInOutGraph;
