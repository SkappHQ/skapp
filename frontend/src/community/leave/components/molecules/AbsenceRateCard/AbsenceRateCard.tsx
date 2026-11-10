import { TrendingUp } from "@mui/icons-material";
import { Box, Chip, Theme, Typography, useTheme } from "@mui/material";
import { FC, JSX } from "react";

import AnalyticCard from "~community/common/components/molecules/AnalyticCard/AnalyticCard";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AbsenceRateType } from "~community/leave/types/AnalyticsTypes";

import styles from "./styles";

interface Props {
  absenceRate?: AbsenceRateType;
  isLoading: boolean;
  isError: boolean;
}

const AbsenceRateCard: FC<Props> = ({ absenceRate, isLoading, isError }) => {
  const translateText = useTranslator("leaveModule", "dashboard");
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const currentAbsenceRate = absenceRate?.currentAbsenceRate;
  const monthBeforeAbsenceRate = absenceRate?.monthBeforeAbsenceRate ?? 0;
  const isAbsenceTrendNonNegative = monthBeforeAbsenceRate >= 0;
  const trendColor = isAbsenceTrendNonNegative
    ? theme.palette.greens.deepShadows
    : theme.palette.error.contrastText;
  const trendBackgroundColor = isAbsenceTrendNonNegative
    ? theme.palette.greens.lighter
    : theme.palette.error.light;

  const renderContent = (): JSX.Element | null => {
    if (isLoading) {
      return null;
    }

    if (isError) {
      return (
        <Typography variant="body2" sx={classes.error} role="alert">
          {translateText(["somethingWentWrong"])}
        </Typography>
      );
    }

    if (typeof currentAbsenceRate !== "number") {
      return <Typography sx={classes.analytic}>{"-"}</Typography>;
    }

    return (
      <Box sx={classes.content}>
        <Typography sx={classes.analytic}>
          {`${currentAbsenceRate.toFixed(1)} %`}
        </Typography>
        <Chip
          icon={<TrendingUp style={{ color: trendColor }} />}
          label={`${monthBeforeAbsenceRate.toFixed(0)}% ${translateText(["trend"])}`}
          sx={{
            ...classes.trendChip,
            color: trendColor,
            backgroundColor: trendBackgroundColor
          }}
        />
      </Box>
    );
  };

  return (
    <AnalyticCard title={translateText(["absenceRate"]) ?? ""}>
      {renderContent()}
    </AnalyticCard>
  );
};

export default AbsenceRateCard;
