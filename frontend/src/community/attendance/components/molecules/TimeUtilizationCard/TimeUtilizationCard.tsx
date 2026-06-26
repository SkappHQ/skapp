import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { TimeUtilizationTrendTypes } from "~community/attendance/types/timeSheetTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";

interface Props {
  lastThirtyDayChange?: string | number;
  trend?: string;
  percentage?: string | number;
}

const TimeUtilizationCard: FC<Props> = ({
  lastThirtyDayChange,
  trend,
  percentage
}) => {
  const translateText = useTranslator(
    "attendanceModule",
    "timesheet",
    "individualTimeSheetAnalytics"
  );
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "grey.50",
        p: 1.5,
        borderRadius: 2,
        height: "100%"
      }}
    >
      <>
        <Stack direction="row" justifyContent="center" sx={{ mt: ".75rem" }}>
          <Typography variant="body1" color="primary.dark">
            {translateText(["timeUtilizationCardTitle"])}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="center" sx={{ mt: "1.5rem" }}>
          <Typography fontSize={63} fontWeight={600} color="common.black">
            {`${percentage}%`}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="center" sx={{ mt: "1.5rem" }}>
          <Chip
            clickable={false}
            icon={
              trend === TimeUtilizationTrendTypes.TREND_UP ? (
                <TrendingUp style={{ color: theme.palette.greens.midDark }} />
              ) : (
                <TrendingDown
                  style={{ color: theme.palette.error.contrastText }}
                />
              )
            }
            label={`${lastThirtyDayChange}% ${translateText([
              "timeUtilizationCardDescription"
            ])}`}
            sx={{
              color:
                trend === TimeUtilizationTrendTypes.TREND_UP
                  ? theme.palette.greens.deepShadows
                  : theme.palette.error.contrastText,
              backgroundColor:
                trend === TimeUtilizationTrendTypes.TREND_UP
                  ? theme.palette.greens.lighter
                  : theme.palette.error.light,
              [theme.breakpoints.down("md")]: {
                fontSize: "0.625rem",
                lineHeight: "0.625rem"
              }
            }}
          />
        </Stack>
      </>
    </Box>
  );
};

export default TimeUtilizationCard;
