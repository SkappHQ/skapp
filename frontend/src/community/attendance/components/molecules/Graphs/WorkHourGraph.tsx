import { Box, Stack, Typography, useTheme } from "@mui/material";
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
  WORK_HOUR_TREND_SHIFT_DAYS
} from "~community/attendance/utils/echartOptions/constants";
import { useWorkHourTrendChartOptions } from "~community/attendance/utils/echartOptions/workHourTrendChartOptions";
import {
  calculateChartIndices,
  handleGraphKeyboardNavigation,
  showTooltipAtIndex
} from "~community/attendance/utils/graphKeyboardNavigationUtils";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import { FilledArrow } from "~community/common/components/atoms/FilledArrow/FilledArrow";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { XIndexTypes } from "~community/common/types/CommonTypes";
import { getMonthName } from "~community/common/utils/dateTimeUtils";
import { getTabIndex } from "~community/common/utils/keyboardUtils";

import ChartNavigationArrows from "../../atoms/ChartNavigationArrows/ChartNavigationArrows";
import TimesheetClockInOutSkeleton from "../Skeletons/TimesheetClockInOutSkeleton";

interface Props {
  isLoading?: boolean;
  error?: Error;
  data: {
    preProcessedData: number[];
    labels: string[];
  };
  title?: string;
  month: number;
  setMonth: Dispatch<SetStateAction<number>>;
}

const WorkHourGraph = ({
  isLoading,
  error,
  data,
  title,
  month,
  setMonth
}: Props): JSX.Element => {
  const { isFreeTier } = useSessionData();

  const translations = useTranslator("attendanceModule", "dashboards");
  const translateTextAria = useTranslator("attendanceAria", "dashboards");

  const { preProcessedData: datasets = [], labels = [] } = !isLoading
    ? data
    : {};

  const [xIndexDay, setXIndexDay] = useState<XIndexTypes>({
    startIndex: 0,
    endIndex: WORK_HOUR_TREND_SHIFT_DAYS
  });

  const chartRef = useRef<ReactECharts | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    const startIndex = DateTime.local().day <= 15 ? 0 : 15;
    const endIndex = startIndex + WORK_HOUR_TREND_SHIFT_DAYS;

    setXIndexDay({
      startIndex,
      endIndex
    });
  }, [data]);

  const chartOptions = useWorkHourTrendChartOptions(
    labels,
    xIndexDay,
    datasets
  );

  const theme = useTheme();

  const handleClick = (direction: string): void => {
    setXIndexDay((prev) =>
      calculateChartIndices({
        currentIndices: prev,
        direction,
        shiftAmount: WORK_HOUR_TREND_SHIFT_DAYS,
        totalLabels: labels.length
      })
    );
  };

  const handleChevronVisibility = (direction: "left" | "right"): string => {
    switch (direction) {
      case GRAPH_LEFT:
        return xIndexDay.startIndex <= 0 ? "hidden" : "visible";
      case GRAPH_RIGHT:
        return xIndexDay.endIndex >= labels.length - 1 ? "hidden" : "visible";
    }
  };

  const handleArrowClick = (direction: "left" | "right"): void => {
    if (direction === GRAPH_LEFT && month > 1) setMonth(month - 1);
    else if (direction === GRAPH_RIGHT && month < 12) setMonth(month + 1);
  };

  const FIRST_MONTH = 1;
  const LAST_MONTH = 12;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: ".75rem 1.5rem",
        height: "100%",
        gap: "1rem",
        backgroundColor: theme.palette.grey[50],
        borderRadius: ".75rem",
        width: "100%",
        pt: ".9375rem"
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
          {title}
        </Typography>

        {/* Month Navigator */}
        <Stack direction="row" gap="0.25rem">
          {month > FIRST_MONTH && (
            <FilledArrow
              onClick={() => handleArrowClick(GRAPH_LEFT)}
              isRightArrow={false}
              backgroundColor="grey.100"
              disabled={month === FIRST_MONTH || isFreeTier}
              ariaLabel={translateTextAria(["lateArrivalTrendMonthlyPrevious"])}
            />
          )}
          <ReadOnlyChip
            label={getMonthName(month)}
            chipStyles={{ backgroundColor: "grey.100", width: "7.5rem" }}
          />

          {month < LAST_MONTH && (
            <FilledArrow
              onClick={() => handleArrowClick(GRAPH_RIGHT)}
              isRightArrow
              backgroundColor="grey.100"
              disabled={month === LAST_MONTH || isFreeTier}
              ariaLabel={translateTextAria(["lateArrivalTrendMonthlyNext"])}
            />
          )}
        </Stack>
      </Box>
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
        {datasets.length === 0 ? null : error ? (
          <Typography>{translations(["error"])}</Typography>
        ) : isLoading ? (
          <TimesheetClockInOutSkeleton />
        ) : (
          <>
            <Box
              sx={{
                width: "100%",
                height: "100%"
              }}
              tabIndex={0}
              onKeyDown={(event) =>
                handleGraphKeyboardNavigation({
                  event,
                  highlightedIndex: focusedIndex,
                  setHighlightedIndex: setFocusedIndex,
                  chartDataLabels: labels,
                  xIndexDay,
                  handleClick,
                  chartRef: chartRef
                })
              }
              onFocus={() => showTooltipAtIndex(chartRef, focusedIndex)}
            >
              <ReactECharts
                option={chartOptions}
                style={{ height: "10rem" }}
                ref={chartRef}
              />
            </Box>
            <ChartNavigationArrows
              tabIndex={getTabIndex(isFreeTier)}
              hasData={data.preProcessedData.length !== 0}
              handleClick={handleClick}
              handleChevronVisibility={handleChevronVisibility}
              leftAriaLabel={translateTextAria([
                "averageHoursWorkedPreviousDates"
              ])}
              leftStyles={{
                position: "absolute",
                bottom: "0.5rem",
                left: "5%",
                cursor: "pointer",
                visibility: handleChevronVisibility(GRAPH_LEFT)
              }}
              rightAriaLabel={translateTextAria([
                "averageHoursWorkedNextDates"
              ])}
              rightStyles={{
                position: "absolute",
                bottom: "0.5rem",
                right: "0.5%",
                cursor: "pointer",
                visibility: handleChevronVisibility(GRAPH_RIGHT)
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default WorkHourGraph;
