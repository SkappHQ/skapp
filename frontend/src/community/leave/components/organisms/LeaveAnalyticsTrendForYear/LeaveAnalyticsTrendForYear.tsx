import { Stack, Typography } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  LeaveTrendReturnTypes,
  SelectedFiltersTypes
} from "~community/leave/types/TeamLeaveAnalyticsTypes";
import {
  formatChartButtonList,
  updateToggleState
} from "~community/leave/utils/TeamLeaveAnalyticsUtils";

import AnalyticGraphSkeleton from "../../molecules/AnalyticGraphSkeleton/AnalyticGraphSkeleton";
import LeaveTrendForYear from "../../molecules/LeaveTrendForYear/LeaveTrendForYear";
import LeaveTypeBreakdownButtons from "../../molecules/LeaveTypeBreakdownButtons/LeaveTypeBreakdownButtons";

interface Props {
  isLoading: boolean;
  data: LeaveTrendReturnTypes;
  chartFilters: SelectedFiltersTypes;
  setChartFilters: (value: SelectedFiltersTypes) => void;
}

const LeaveAnalyticsTrendForYear: FC<Props> = ({
  data,
  isLoading,
  chartFilters,
  setChartFilters
}) => {
  const translateText = useTranslator("leaveModule", "analytics");
  const [colors, setColors] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const { getLabels, getSelectedValues, getColors } = useMemo(() => {
    if (!isLoading) {
      const labels =
        data?.leaveTypeForYearDataSeries?.reduce((acc, leaveType) => {
          return [...acc, leaveType?.leaveTypeName];
        }, []) || [];
      const selectedValues = data?.leaveTypeForYearDataSeries?.reduce(
        (acc, item) => ({
          ...acc,
          [item.leaveTypeName]: item.selected
        }),
        {}
      );
      const colors =
        data?.leaveTypeForYearDataSeries?.reduce((acc, leaveType) => {
          return [...acc, leaveType?.color];
        }, []) || [];

      return {
        getLabels: labels,
        getSelectedValues: selectedValues,
        getColors: colors
      };
    }
    return {
      getLabels: [],
      getSelectedValues: {},
      getColors: []
    };
  }, [data?.leaveTypeForYearDataSeries, isLoading]);

  const getSelectedToggleCount = useMemo(() => {
    if (chartFilters) {
      return Object?.values(chartFilters)?.reduce(
        (count: number, value: boolean) => {
          if (value) {
            return count + 1;
          }
          return count;
        },
        0
      );
    }
    return 0;
  }, [chartFilters]);

  useEffect(() => {
    if (chartFilters && setChartFilters) {
      if (Object.values(chartFilters)?.length === 0)
        setChartFilters(getSelectedValues);
    }
    setColors(getColors);
    setLabels(getLabels);
  }, [chartFilters, getColors, getLabels, getSelectedValues, setChartFilters]);

  const onTogglerClick = (buttonType: string) => {
    setChartFilters(
      updateToggleState({ buttonType, initialList: chartFilters })
    );
  };

  return (
    <Stack
      sx={{
        p: 1.5,
        bgcolor: "grey.100",
        borderRadius: 1.5,
        height: "15rem",
        mt: 2
      }}
    >
      {!isLoading ? (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">
              {translateText(["leaveTrendForYear"])}
            </Typography>
            {chartFilters && data?.leaveTypeForYearDataSeries && (
              <LeaveTypeBreakdownButtons
                colors={formatChartButtonList({
                  colorList: colors,
                  labelList: labels
                })}
                onClick={onTogglerClick}
                toggle={chartFilters}
                maxTypeToShow={4}
                isGraph
              />
            )}
          </Stack>
          <LeaveTrendForYear
            leaveTrendData={data}
            labels={getLabels}
            selectedValues={chartFilters}
            selectedToggleCount={getSelectedToggleCount}
          />
        </>
      ) : (
        <AnalyticGraphSkeleton />
      )}
    </Stack>
  );
};

export default LeaveAnalyticsTrendForYear;
