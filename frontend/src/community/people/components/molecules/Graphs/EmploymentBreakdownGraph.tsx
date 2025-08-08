import { Box, Stack, type Theme, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { Dispatch, JSX, SetStateAction } from "react";

import ToggleSwitch from "~community/common/components/atoms/ToggleSwitch/ToggleSwitch";
import NoDataScreen from "~community/common/components/molecules/NoDataScreen/NoDataScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  employmentBreakdownChartAllocationLegendItems,
  employmentBreakdownChartTypeLegendItems,
  employmentBreakdownGraphTypes
} from "~community/people/constants/peopleDashboardConstants";
import { EmploymentBreakdownTypes } from "~community/people/enums/peopleDashboardEnums";
import { EmploymentBreakdownType } from "~community/people/types/PeopleDashboardTypes";
import { useEmploymentBreakdownChartOptions } from "~community/people/utils/eChartOptions/employmentBreakdownChartOptions";

import LegendPanel from "./Legend/LegendPanel";
import EmploymentChartSkeleton from "./Skeletons/EmploymentChartSkeleton";
import styles from "./styles";

interface Props {
  error?: Error;
  chartData: EmploymentBreakdownType | undefined;
  isDataLoading?: boolean;
  dataCategory: string;
  setDataCategory: Dispatch<SetStateAction<string>>;
}

const EmploymentBreakdownGraph = ({
  error,
  chartData,
  isDataLoading,
  dataCategory,
  setDataCategory
}: Props): JSX.Element => {
  const translateText = useTranslator("peopleModule");
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const graphData = useEmploymentBreakdownChartOptions(
    chartData ?? { labels: [], values: [], colors: [] }
  );

  return (
    <>
      <Box sx={classes.graphContainer}>
        {error ? (
          <Typography>{translateText(["error"])}</Typography>
        ) : (
          <>
            <Box sx={classes.graphPanel}>
              <Box sx={classes.graphHeader}>
                <Typography sx={classes.title}>
                  {translateText(["dashboard.employmentBreakdown.title"])}
                </Typography>
                <ToggleSwitch
                  options={[
                    { value: employmentBreakdownGraphTypes.TYPE.label },
                    { value: employmentBreakdownGraphTypes.ALLOCATION.label }
                  ]}
                  setCategoryOption={(option: string) => {
                    setDataCategory(
                      option === employmentBreakdownGraphTypes.TYPE.label
                        ? employmentBreakdownGraphTypes.TYPE.value
                        : employmentBreakdownGraphTypes.ALLOCATION.value
                    );
                  }}
                  categoryOption={
                    dataCategory === employmentBreakdownGraphTypes.TYPE.value
                      ? employmentBreakdownGraphTypes.TYPE.label
                      : employmentBreakdownGraphTypes.ALLOCATION.label
                  }
                />
              </Box>
              {isDataLoading ? (
                <EmploymentChartSkeleton />
              ) : !isDataLoading &&
                (!chartData || chartData?.values?.every((val) => val === 0)) ? (
                <Stack height="100%" justifyContent="center">
                  <NoDataScreen />
                </Stack>
              ) : (
                <Box>
                  <ReactECharts
                    option={graphData}
                    style={{ height: "16.5rem", margin: 0 }}
                    opts={{ renderer: "svg" }}
                  />
                  <LegendPanel
                    data={
                      dataCategory === EmploymentBreakdownTypes.TYPE
                        ? employmentBreakdownChartTypeLegendItems
                        : employmentBreakdownChartAllocationLegendItems
                    }
                  />
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default EmploymentBreakdownGraph;
