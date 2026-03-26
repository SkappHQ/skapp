import { Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import ReactECharts from "echarts-for-react";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  formatChartButtonList,
  updateToggleState
} from "~community/common/utils/commonUtil";
import {
  getTabIndex,
  shouldCloseDialog,
  shouldMoveLeft,
  shouldMoveRight
} from "~community/common/utils/keyboardUtils";
import { LeaveTypeBreakDownReturnTypes } from "~community/leave/types/LeaveUtilizationTypes";
import { useLeaveUtilizationChartOptions } from "~community/leave/utils/eChartOptions/leaveUtilizationChartOptions";

import LeaveTypeBreakdownButtons from "./LeaveTypeBreakdownButtons";
import LeaveTypeBreakdownSkeleton from "./Skeletons/LeaveTypeBreakdownSkeleton/LeaveTypeBreakdownSkeleton";
import styles from "./styles";

interface Props {
  isLoading: boolean;
  error: Error | null;
  datasets: LeaveTypeBreakDownReturnTypes | undefined;
  isUserProfileView?: boolean;
}
const LeaveTypeBreakdownChart = ({
  isLoading,
  error,
  datasets,
  isUserProfileView
}: Props): JSX.Element => {
  const { isFreeTier } = useSessionData();

  const chartRef = useRef<ReactECharts>(null);

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateTexts = useTranslator("leaveModule", "dashboard");
  const translateAria = useTranslator("leaveAria", "dashboard");

  const { isDrawerExpanded } = useCommonStore((state) => ({
    isDrawerExpanded: state.isDrawerExpanded
  }));

  const [buttonColors, setButtonColors] = useState<string[]>([]);
  const [toggle, setToggle] = useState<Record<string, boolean> | undefined>(
    datasets?.toggle
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const chartData = useLeaveUtilizationChartOptions({
    datasets,
    toggle,
    monthsArray: datasets?.months
  });

  useEffect(() => {
    if (toggle === undefined) setToggle(datasets?.toggle);
  }, [datasets?.toggle, toggle]);

  useEffect(() => {
    if (datasets?.data) {
      setButtonColors(datasets?.data.map((data) => data.color));
    }
  }, [datasets?.data]);

  const resizeChart = useCallback(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.resize();
    }
  }, [chartRef, isDrawerExpanded]);

  const toggleData = (leaveType: string): void => {
    setToggle(
      updateToggleState({
        buttonType: leaveType,
        initialList: toggle
      })
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    const totalBars = datasets?.months?.length || 0;

    if (!chartInstance) return;

    if (shouldMoveRight(event.key)) {
      const newIndex = (highlightedIndex + 1) % totalBars;
      setHighlightedIndex(newIndex);
      chartInstance.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: newIndex
      });
    }

    if (shouldMoveLeft(event.key)) {
      const newIndex = (highlightedIndex - 1 + totalBars) % totalBars;
      setHighlightedIndex(newIndex);
      chartInstance.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: newIndex
      });
    }

    if (shouldCloseDialog(event.key)) {
      chartInstance.dispatchAction({
        type: "hideTip"
      });
    }
  };

  return (
    <>
      {!isLoading ? (
        <Stack sx={classes.container}>
          <Stack sx={classes.innerContainer}>
            <Stack sx={classes.header}>
              <Typography variant="h4">
                {translateTexts(["leaveUtilization"])}
              </Typography>
              <LeaveTypeBreakdownButtons
                toggle={toggle}
                onClick={toggleData}
                colors={formatChartButtonList({
                  colorList: buttonColors,
                  labelList: datasets?.labels || []
                })}
                isGraph
              />
            </Stack>
            {isLoading || toggle === undefined ? (
              <Box sx={classes.loadingPlaceholder} />
            ) : error ? (
              <Box sx={classes.errorContainer}>
                <Typography>
                  {translateTexts(["somethingWentWrong"])}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display:
                    toggle &&
                    !Object.values(toggle).every((value: Object) => !value)
                      ? "block"
                      : "none",
                  ...classes.chartContainer
                }}
                tabIndex={getTabIndex(!isFreeTier || !isUserProfileView)}
                role="application"
                aria-label={translateAria(["leaveUtilizationChart"])}
                onKeyDown={handleKeyPress}
                onFocus={() => {
                  const chartInstance = chartRef.current?.getEchartsInstance();
                  if (chartInstance && datasets?.months?.length) {
                    chartInstance.dispatchAction({
                      type: "showTip",
                      seriesIndex: 0,
                      dataIndex: highlightedIndex
                    });
                  }
                }}
              >
                <ReactECharts
                  option={chartData}
                  ref={chartRef}
                  style={{ width: "100%" }}
                  opts={{ renderer: "canvas" }}
                  onEvents={{
                    rendered: resizeChart
                  }}
                />
              </Box>
            )}
          </Stack>
        </Stack>
      ) : (
        <LeaveTypeBreakdownSkeleton />
      )}
    </>
  );
};

export default LeaveTypeBreakdownChart;
