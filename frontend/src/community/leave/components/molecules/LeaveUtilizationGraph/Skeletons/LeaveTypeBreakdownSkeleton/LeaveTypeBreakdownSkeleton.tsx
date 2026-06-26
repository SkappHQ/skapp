import { Skeleton, Theme, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import { JSX } from "react";

import LeaveTypeBreakdownBarChartSkeleton from "~community/leave/components/molecules/LeaveUtilizationGraph/Skeletons/LeaveTypeBreakdownBarChartSkeleton/LeaveTypeBreakdownBarChartSkeleton";

import styles from "./styles";

const LeaveTypeBreakdownSkeleton = (): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={classes.container}>
      <Stack sx={classes.headerStack}>
        <Skeleton sx={classes.titleSkeleton} animation={"wave"} />
        <Stack sx={classes.buttonGroup}>
          <Skeleton sx={classes.buttonSkeleton} animation={"wave"} />
          <Skeleton sx={classes.buttonSkeleton} animation={"wave"} />
          <Skeleton sx={classes.buttonSkeleton} animation={"wave"} />
        </Stack>
      </Stack>
      <Stack sx={classes.chartContainer}>
        <Skeleton component="div" sx={classes.barSkeleton} animation={"wave"} />
        <LeaveTypeBreakdownBarChartSkeleton />
      </Stack>
    </Stack>
  );
};

export default LeaveTypeBreakdownSkeleton;
