import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";

import {
  ClockInOutGraphTypes,
  ClockInSummaryTypes
} from "~community/attendance/enums/dashboardEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { IconName } from "~community/common/types/IconTypes";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

interface Props {
  title?: string;
  analytic1?: number;
  analytic2?: number;
  type: string;
  iconAriaLabel?: string;
}

const AttendanceCard: FC<Props> = ({
  analytic1,
  analytic2,
  title,
  type,
  iconAriaLabel
}) => {
  const router = useRouter();
  const { setClockInType } = useAttendanceStore((state) => state);
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          flex: 1,
          backgroundColor: "grey.50",
          p: 1.5,
          borderRadius: 1.5,
          height: "100%"
        }}
      >
        <>
          <Stack
            direction="row"
            justifyContent="start"
            alignItems="left"
          ></Stack>
          <Box display={"flex"} justifyContent="space-between">
            <Typography
              variant="body1"
              fontSize={14}
              component="h1"
              fontWeight={400}
              color={theme.palette.text.textGrey}
            >
              {title}
            </Typography>
            <Box
              tabIndex={0}
              role="button"
              aria-label={iconAriaLabel}
              sx={{ cursor: "pointer" }}
              onClick={() => {
                type === ClockInOutGraphTypes.CLOCK_IN
                  ? setClockInType({})
                  : setClockInType({
                      "Clock-ins": [ClockInSummaryTypes.LATE_CLOCK_INS]
                    });

                router.replace(ROUTES.DASHBOARD.ATTENDANCE.CLOCK_IN_SUMMARY);
              }}
              onKeyDown={(e) => {
                if (shouldActivateButton(e.key)) {
                  type === ClockInOutGraphTypes.CLOCK_IN
                    ? setClockInType({})
                    : setClockInType({
                        "Clock-ins": [ClockInSummaryTypes.LATE_CLOCK_INS]
                      });

                  router.replace(ROUTES.DASHBOARD.ATTENDANCE.CLOCK_IN_SUMMARY);
                }
              }}
            >
              <Icon name={IconName.NEW_WINDOW_ICON} />
            </Box>
          </Box>
          <Stack direction="row" justifyContent="left">
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <Typography style={{ fontSize: "2.5rem", fontWeight: 600 }}>
                {analytic1 ?? "--"}
              </Typography>
              {type === ClockInOutGraphTypes.CLOCK_IN && (
                <Typography style={{ fontSize: "1.25rem", fontWeight: 400 }}>
                  {`/${analytic2 ?? "--"}`}
                </Typography>
              )}
            </div>
          </Stack>
        </>
      </Box>
    </>
  );
};

export default AttendanceCard;
