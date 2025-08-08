import { Box, Stack, type Theme, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { JSX } from "react";

import NoDataScreen from "~community/common/components/molecules/NoDataScreen/NoDataScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { GenderDistributionType } from "~community/people/types/PeopleDashboardTypes";
import { useGenderDistributionChartOptions } from "~community/people/utils/eChartOptions/genderDistributionChartOptions";

import GenderChartSkeleton from "./Skeletons/GenderChartSkeleton";
import styles from "./styles";

interface Props {
  error?: Error;
  chartData: GenderDistributionType[];
  isDataLoading?: boolean;
}

const GenderDistributionGraph = ({
  error,
  chartData,
  isDataLoading
}: Props): JSX.Element => {
  const translateText = useTranslator("peopleModule");
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const graphData = useGenderDistributionChartOptions(chartData);
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
                  {translateText(["dashboard.genderDistributionChartTitle"])}
                </Typography>
              </Box>
              {isDataLoading ? (
                <GenderChartSkeleton />
              ) : !isDataLoading &&
                (chartData?.length === 0 ||
                  chartData.every((item) => item.value === 0)) ? (
                <Stack height="100%" justifyContent="center">
                  <NoDataScreen />
                </Stack>
              ) : (
                <Box>
                  <ReactECharts
                    option={graphData}
                    style={{ height: "18rem", margin: 0 }}
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

export default GenderDistributionGraph;
