import { Stack } from "@mui/material";
import ReactECharts, { EChartsOption } from "echarts-for-react";

import TableEmptyScreen from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import {
  calculateMaxMonth,
  calculateMinMonth
} from "~community/common/utils/dateTimeUtils";
import { useTraverseMonthGraph } from "~community/leave/hooks/useTraverseMonthGraph";
import {
  LeaveTrendReturnTypes,
  SelectedFiltersTypes
} from "~community/leave/types/TeamLeaveAnalyticsTypes";
import { LeaveTrendForYearLineChartOptions } from "~community/leave/utils/eChartOptions/lineChartOptions";

import ChartXAxisTraverse from "../ChartXAxisTraverse/ChartXAxisTraverse";

interface Props {
  leaveTrendData: LeaveTrendReturnTypes;
  labels: string[];
  selectedValues: SelectedFiltersTypes;
  selectedToggleCount: number;
}

const LeaveTrendForYear = ({
  leaveTrendData,
  labels,
  selectedValues,
  selectedToggleCount
}: Props) => {
  const isTabScreen = useMediaQuery()(MediaQueries.BELOW_1024);
  const isPhoneScreen = useMediaQuery()(MediaQueries.BELOW_900);
  const { monthIndex, moveChart } = useTraverseMonthGraph(
    leaveTrendData?.months
  );
  return (
    <>
      {leaveTrendData?.leaveChartDataSeries?.length === 0 ||
      leaveTrendData?.leaveTypeForYearDataSeries?.length === 0 ? (
        <Stack height="100%" justifyContent="center">
          <TableEmptyScreen
            title="No data to display"
            description="No data to display yet. When there is data, they will be displayed here."
          />
        </Stack>
      ) : selectedToggleCount === 0 ? (
        <Stack height="100%" justifyContent="center">
          <TableEmptyScreen
            title="Select a leave type to display"
            description="Select the type of the leave you want to display, and we would do the rest for you"
          />
        </Stack>
      ) : (
        <ReactECharts
          option={
            LeaveTrendForYearLineChartOptions(
              leaveTrendData,
              labels,
              selectedValues,
              calculateMinMonth(isPhoneScreen, isTabScreen, monthIndex.min),
              calculateMaxMonth(isPhoneScreen, isTabScreen, monthIndex.max),
              leaveTrendData?.months
            ) as EChartsOption
          }
          style={{ height: "1000rem" }}
        />
      )}
      <ChartXAxisTraverse
        isDisplay={isTabScreen}
        toggleNeeded={false}
        monthIndex={monthIndex}
        moveChart={moveChart}
        bottomPosition=".375rem"
      />
    </>
  );
};

export default LeaveTrendForYear;
