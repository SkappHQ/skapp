import { Box, Stack, SxProps, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { JSX } from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import useSessionData from "~community/common/hooks/useSessionData";
import { getTabIndex } from "~community/common/utils/keyboardUtils";
import {
  PieChartPosition,
  PieChartSeriesData
} from "~community/leave/types/AnalyticsTypes";
import { PieChartOptionConfig } from "~community/leave/utils/eChartOptions/pieChartOptions";

interface Props {
  cardTitle: string;
  emoji: string;
  value: number;
  isEnabledPieChart?: boolean;
  pieChartSeriesData?: PieChartSeriesData[];
  monthOverMonthPercentage?: number;
  isShowPercentageMark?: boolean;
  description?: string;
  pieChartPosition?: PieChartPosition;
  denominator?: number;
  cardStyles?: SxProps;
  titleStyles?: SxProps;
  percentageNumberStyles?: SxProps;
  isIndividualCard?: boolean;
}

const AnalyticCard = ({
  cardTitle,
  emoji,
  value,
  isEnabledPieChart = true,
  pieChartSeriesData = [],
  cardStyles,
  pieChartPosition = "center",
  denominator,
  titleStyles,
  isIndividualCard = false
}: Props): JSX.Element => {
  const { isFreeTier } = useSessionData();

  const generatePieChartSeries = (pieChartSeriesData: PieChartSeriesData[]) => {
    const total = pieChartSeriesData?.reduce(
      (acc, seriesData) => acc + seriesData?.value,
      0
    );
    const pieChartSeries =
      pieChartSeriesData?.map(({ name, value }) => ({
        name,
        value
      })) || [];

    const pieChartRestData = { name: "available", value: 100 - total };
    return [pieChartRestData, ...pieChartSeries];
  };

  const pieChartData: PieChartSeriesData[] = isEnabledPieChart
    ? generatePieChartSeries(pieChartSeriesData)
    : [];
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "grey.100",
        p: 1.5,
        borderRadius: 1.5,
        height: "100%",
        ...cardStyles
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            overflow: "hidden"
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ width: "100%", minWidth: 0 }}
          >
            <IconChip
              icon={emoji}
              chipStyles={{
                width: "2rem",
                height: "2rem",
                p: 0,
                minWidth: "auto",
                "& .MuiChip-label": {
                  display: "none"
                },
                background: "none"
              }}
              tabIndex={getTabIndex(isFreeTier)}
            />
            <Typography
              variant="body2"
              marginTop={0.5}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                minWidth: 0,
                ...titleStyles
              }}
            >
              {cardTitle}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            minWidth: "5.8rem",
            minHeight: "5.5rem",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            padding: 0
          }}
        >
          <ReactECharts
            option={PieChartOptionConfig(
              pieChartData,
              pieChartPosition,
              isIndividualCard
            )}
            style={{ width: "100%", height: "100%" }}
          />
          <Box sx={{ position: "absolute" }}>
            <Typography variant="h1" color="common.black">
              {value}
              {denominator && (
                <Typography
                  variant="smallTitle"
                  color="common.black"
                  alignSelf="flex-end"
                >
                  /{denominator}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default AnalyticCard;
