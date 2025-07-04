import { Box, type Theme, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { DateTime } from "luxon";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";

import {
  GRAPH_LEFT,
  GRAPH_RIGHT,
  LATE_ARRIVALS_CHART_SHIFT_DAYS,
  lateArrivalsGraphTypes
} from "~community/attendance/utils/echartOptions/constants";
import { useLateArrivalsGraphOptions } from "~community/attendance/utils/echartOptions/lateArrivalsGraphOptions";
import {
  handleGraphKeyboardNavigation,
  showTooltipAtIndex
} from "~community/attendance/utils/graphKeyboardNavigationUtils";
import ToggleSwitch from "~community/common/components/atoms/ToggleSwitch/ToggleSwitch";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { XIndexTypes } from "~community/common/types/CommonTypes";

import ChartNavigationArrows from "../../atoms/ChartNavigationArrows/ChartNavigationArrows";
import TimesheetClockInOutSkeleton from "../Skeletons/TimesheetClockInOutSkeleton";

interface Props {
  error?: Error;
  chartData: {
    preProcessedData: number[];
    labels: string[];
  };
  type?: string;
  dataCategory?: string;
  setDataCategory: Dispatch<SetStateAction<string>>;
  withTeamFilter?: boolean;
  isDataLoading?: boolean;
  title?: string;
}

const LateArrivalsGraph = ({
  error,
  chartData,
  dataCategory,
  setDataCategory,
  isDataLoading
}: Props): JSX.Element => {
  const translations = useTranslator("attendanceModule", "dashboards");
  const translateTextAria = useTranslator("attendanceAria", "dashboards");

  const theme: Theme = useTheme();
  const currentMonth = DateTime.local().toFormat("MMM");

  const lateArrivalChartRef = useRef<ReactECharts>(null);

  const findTimeIndex = (labels: string[], standardTime: string) => {
    return (
      labels?.findIndex((time: string) => time?.includes(standardTime)) - 3
    );
  };

  const [xIndexDay, setXIndexDay] = useState<XIndexTypes>({
    startIndex: 0,
    endIndex: 0
  });

  const [lateArrivalHighlightedIndex, setLateArrivalHighlightedIndex] =
    useState<number>(xIndexDay.startIndex);

  const MaxNumberOfWeeks = 51;
  const MaxNumberOfMonths = 12;

  // set start and end index around current week/month
  useEffect(() => {
    const startIndex =
      dataCategory === lateArrivalsGraphTypes.WEEKLY.value
        ? findTimeIndex(chartData.labels, currentMonth) + 1
        : findTimeIndex(chartData.labels, currentMonth);
    const endIndex = startIndex + LATE_ARRIVALS_CHART_SHIFT_DAYS;

    setXIndexDay({
      startIndex,
      endIndex
    });
    setLateArrivalHighlightedIndex(startIndex);
  }, [chartData?.labels, dataCategory]);

  const lateArrivalsGraphOptions = useLateArrivalsGraphOptions(
    chartData,
    xIndexDay
  );

  const handleClick = (direction: string): void => {
    if (direction === GRAPH_LEFT) {
      setXIndexDay((prev) => ({
        startIndex: prev.startIndex - LATE_ARRIVALS_CHART_SHIFT_DAYS,
        endIndex: prev.endIndex - LATE_ARRIVALS_CHART_SHIFT_DAYS
      }));
    }
    if (direction === GRAPH_RIGHT) {
      setXIndexDay((prev) => ({
        startIndex: prev.startIndex + LATE_ARRIVALS_CHART_SHIFT_DAYS,
        endIndex: prev.endIndex + LATE_ARRIVALS_CHART_SHIFT_DAYS
      }));
    }
  };

  const handleChevronVisibility = (direction: "left" | "right"): string => {
    const isWeekly = dataCategory === lateArrivalsGraphTypes.WEEKLY.value;
    const maxIndex = isWeekly ? MaxNumberOfWeeks : MaxNumberOfMonths;

    if (direction === GRAPH_LEFT) {
      return xIndexDay.startIndex <= 0 ? "hidden" : "visible";
    }

    if (direction === GRAPH_RIGHT) {
      return xIndexDay.endIndex >= maxIndex ? "hidden" : "visible";
    }

    return "hidden";
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
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem"
                  }}
                >
                  {translations(["attendanceDashboard.lateArrivals"])}
                </Typography>
                <ToggleSwitch
                  options={[
                    {
                      ariaLabel: translateTextAria(["lateArrivalTrendWeekly"]),
                      value: lateArrivalsGraphTypes.WEEKLY.label
                    },
                    {
                      ariaLabel: translateTextAria(["lateArrivalTrendMonthly"]),
                      value: lateArrivalsGraphTypes.MONTHLY.label
                    }
                  ]}
                  setCategoryOption={(option: string) => {
                    setDataCategory(
                      option === lateArrivalsGraphTypes.WEEKLY.label
                        ? lateArrivalsGraphTypes.WEEKLY.value
                        : lateArrivalsGraphTypes.MONTHLY.value
                    );
                  }}
                  categoryOption={
                    dataCategory === lateArrivalsGraphTypes.WEEKLY.value
                      ? lateArrivalsGraphTypes.WEEKLY.label
                      : lateArrivalsGraphTypes.MONTHLY.label
                  }
                />
              </Box>
              {isDataLoading ? (
                <TimesheetClockInOutSkeleton />
              ) : (
                <Box
                  tabIndex={0}
                  role="application"
                  aria-label={translateTextAria(["lateArrivalChart"], {
                    type:
                      dataCategory === lateArrivalsGraphTypes.WEEKLY.value
                        ? lateArrivalsGraphTypes.WEEKLY.label
                        : lateArrivalsGraphTypes.MONTHLY.label
                  })}
                  onKeyDown={(event) =>
                    handleGraphKeyboardNavigation({
                      event,
                      highlightedIndex: lateArrivalHighlightedIndex,
                      setHighlightedIndex: setLateArrivalHighlightedIndex,
                      chartDataLabels: chartData.labels,
                      xIndexDay,
                      handleClick,
                      chartRef: lateArrivalChartRef
                    })
                  }
                  onFocus={() =>
                    showTooltipAtIndex(
                      lateArrivalChartRef,
                      lateArrivalHighlightedIndex
                    )
                  }
                >
                  <ReactECharts
                    option={lateArrivalsGraphOptions}
                    style={{ height: "16.25rem" }}
                    ref={lateArrivalChartRef}
                  />
                </Box>
              )}
            </Box>
            <ChartNavigationArrows
              tabIndex={0}
              hasData={chartData?.preProcessedData?.length !== 0}
              handleClick={handleClick}
              handleChevronVisibility={handleChevronVisibility}
              leftAriaLabel={
                dataCategory === lateArrivalsGraphTypes.WEEKLY.value
                  ? translateTextAria(["lateArrivalTrendWeeklyPrevious"])
                  : translateTextAria(["lateArrivalTrendMonthlyPrevious"])
              }
              rightAriaLabel={
                dataCategory === lateArrivalsGraphTypes.WEEKLY.value
                  ? translateTextAria(["lateArrivalTrendWeeklyNext"])
                  : translateTextAria(["lateArrivalTrendMonthlyNext"])
              }
            />
          </>
        )}
      </Box>
    </>
  );
};

export default LateArrivalsGraph;
