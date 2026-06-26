import { Box, Stack, type Theme, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { JSX } from "react";

import NoDataScreen from "~community/common/components/molecules/NoDataScreen/NoDataScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { JobFamilyOutput } from "~community/people/types/PeopleDashboardTypes";
import { useJobFamilyOverviewChartOptions } from "~community/people/utils/eChartOptions/jobFamilyOverviewChartOptions";

import JobFamilyChartSkeleton from "./Skeletons/JobFamilyChartSkeleton";
import styles from "./styles";

interface Props {
  error?: Error;
  chartData: JobFamilyOutput[];
  isDataLoading?: boolean;
}

const JobFamilyOverviewGraph = ({
  error,
  chartData,
  isDataLoading
}: Props): JSX.Element => {
  const translateText = useTranslator("peopleModule");
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const graphData = useJobFamilyOverviewChartOptions(chartData);

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
                  {translateText(["dashboard.jobFamilyChartTitle"])}
                </Typography>
              </Box>
              {isDataLoading ? (
                <JobFamilyChartSkeleton />
              ) : !isDataLoading && chartData?.length === 0 ? (
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
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default JobFamilyOverviewGraph;
