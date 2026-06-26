import { Box, Stack, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";

import styles from "./styles";

interface Props {
  headerLabels: string[];
}

const TimesheetDailyRecordTableHeader: FC<Props> = ({ headerLabels }) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));
  const classes = styles(theme);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={classes.stackContainer}
    >
      <Box sx={classes.boxContainer(isDrawerToggled)}>
        <Typography variant="tableHeader" sx={classes.fontHeaderStyles}>
          {translateText(["dateHeaderTxt"])}
        </Typography>
        <Typography variant="tableHeader" sx={classes.fontHeaderStyles}>
          {translateText(["workedHourHeaderTxt"])}
        </Typography>
      </Box>
      {headerLabels?.map((label, index) => (
        <Box key={index} sx={classes.boxHeaderLabelStyles}>
          <Typography variant="tableHeader" sx={classes.fontHeaderLabelStyles}>
            {label?.toUpperCase()}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default TimesheetDailyRecordTableHeader;
