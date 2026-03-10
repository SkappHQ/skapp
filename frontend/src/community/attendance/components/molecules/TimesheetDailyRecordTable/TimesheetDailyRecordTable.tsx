import { Box, Divider, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useRef, useState } from "react";

import { DailyLogChipTypes } from "~community/attendance/enums/timesheetEnums";
import { DailyLogType } from "~community/attendance/types/timeSheetTypes";
import {
  generateTimeSlots,
  timeStringToDecimalHours
} from "~community/attendance/utils/TimeUtils";
import Icon from "~community/common/components/atoms/Icon/Icon";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { IconName } from "~community/common/types/IconTypes";
import { getTabIndex } from "~community/common/utils/keyboardUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

import TimesheetDailyRecordSkeleton from "../AttendanceSkeletons/TimesheetDailyRecordSkeleton";
import TimesheetDailyRecordTableHeader from "../TimesheetDailyRecordTableHeader/TimesheetDailyRecordTableHeader";
import TimesheetDailyRecordTableRow from "../TimesheetDailyRecordTableRow/TimesheetDailyRecordTableRow";
import styles from "./styles";

interface Props {
  dailyLogData: DailyLogType[];
  downloadEmployeeDailyLogCsv?: () => void;
  isDailyLogLoading?: boolean;
}

const TimesheetDailyRecordTable = ({
  dailyLogData,
  downloadEmployeeDailyLogCsv,
  isDailyLogLoading
}: Props): JSX.Element => {
  const { isFreeTier } = useSessionData();

  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { data: timeConfigData } = useDefaultCapacity();
  const stackRef = useRef<HTMLDivElement | null>(null);
  const classes = styles(theme);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  useEffect(() => {
    setTableHeaders(generateTimeSlots());
  }, []);

  const dailyLogChip = (type: DailyLogChipTypes) => {
    const textSelector: Record<string, string> = {
      WORK: translateText(["workedHoursChipTxt"]),
      BREAK: translateText(["breakChipTxt"]),
      MANUAL: translateText(["manualChipTxt"])
    };

    return (
      <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={"0.5rem"}
      >
        <Box sx={classes.dailyLogChipStyles(type)} />
        <Typography variant="body2">{textSelector[type]}</Typography>
      </Stack>
    );
  };

  useEffect(() => {
    if (!!stackRef && !!timeConfigData && !!stackRef.current) {
      const calculateScrollPosition = () => {
        const hours = timeStringToDecimalHours(
          timeConfigData[0]?.startTime ?? ""
        );
        const scrollWidth = stackRef.current?.scrollWidth ?? 0;
        const scrollPosition = scrollWidth * (hours / 26.8); //26.8 is 24 hours + 2.8 hours for padding
        if (stackRef.current) {
          stackRef.current.scrollLeft = scrollPosition;
        }
      };
      setTimeout(calculateScrollPosition, 2);
    }
  }, [timeConfigData?.[0]?.startTime, dailyLogData, timeConfigData, stackRef]);

  return (
    <Box sx={classes.container}>
      <Stack flexDirection={"row"} justifyContent={"space-between"}>
        <Typography variant="h2">
          {translateText(["dailyLogSectionTitle"])}
        </Typography>
        <Stack
          flexDirection={"row"}
          justifyContent={"space-between"}
          gap={"1.25rem"}
        >
          {dailyLogChip(DailyLogChipTypes.WORK)}
          {dailyLogChip(DailyLogChipTypes.BREAK)}
          {dailyLogChip(DailyLogChipTypes.MANUAL)}
        </Stack>
      </Stack>
      {isDailyLogLoading ? (
        <TimesheetDailyRecordSkeleton />
      ) : (
        <>
          <Stack
            ref={stackRef}
            sx={classes.stackContainer}
            tabIndex={getTabIndex(isFreeTier)}
          >
            {!isDrawerToggled ? (
              <TimesheetDailyRecordTableHeader headerLabels={tableHeaders} />
            ) : (
              <Box sx={classes.boxContainer}>
                <TimesheetDailyRecordTableHeader headerLabels={tableHeaders} />
              </Box>
            )}

            {!isDrawerToggled ? (
              dailyLogData?.map((record) => (
                <TimesheetDailyRecordTableRow
                  record={record}
                  key={record?.date}
                  headerLength={tableHeaders?.length}
                />
              ))
            ) : (
              <Box sx={classes.boxContainer}>
                {dailyLogData?.map((record) => (
                  <TimesheetDailyRecordTableRow
                    record={record}
                    key={record?.date}
                    headerLength={tableHeaders?.length}
                  />
                ))}
              </Box>
            )}
          </Stack>

          <Stack sx={classes.tableFooterStackStyle}>
            <Divider sx={classes.dividerStyle} />
            <Stack direction="row" justifyContent="end" alignItems="center">
              <ButtonV2
                variant={"tertiary"}
                size={"md"}
                fullWidth={false}
                disabled={isFreeTier}
                onClick={downloadEmployeeDailyLogCsv}
                icon={<Icon name={IconName.DOWNLOAD_ICON} />}
                iconPosition="end"
              >
                {translateText(["exportToCsvBtnTxt"])}
              </ButtonV2>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default TimesheetDailyRecordTable;
