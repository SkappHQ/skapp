import { type Theme, useTheme } from "@mui/material/styles";
import { ChangeEvent, JSX, useMemo } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  TimeRecordDataResponseType,
  TimeRecordDataType,
  TimeRecordType
} from "~community/attendance/types/timeSheetTypes";
import { getHeadersWithSubtitles } from "~community/attendance/utils/AllTimeSheetTableUtils";
import { formatDuration } from "~community/attendance/utils/TimeUtils";
import { downloadManagerTimesheetCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import HtmlChip from "~community/common/components/atoms/Chips/HtmlChip/HtmlChip";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/HtmlTable/Table";
import { TableNames } from "~community/common/enums/Table";
import useGetHoliday from "~community/common/hooks/useGetHoliday";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { convertYYYYMMDDToDateTime } from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { getEmoji } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

interface Props {
  recordData: TimeRecordDataResponseType;
  exportRecordData: TimeRecordDataResponseType;
  selectedTab: string;
  orgName?: string;
  teamName?: string;
  isRecordLoading?: boolean;
  isExportRecordDataLoading?: boolean;
}

const EmployeeTimeRecordsTable = ({
  recordData,
  exportRecordData,
  selectedTab,
  orgName,
  teamName,
  isRecordLoading,
  isExportRecordDataLoading
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const theme: Theme = useTheme();

  const { timesheetAnalyticsParams, setTimesheetAnalyticsPagination } =
    useAttendanceStore((state) => state);

  const { data: timeConfigData } = useDefaultCapacity();

  const { getHolidaysArrayByDate } = useGetHoliday();

  const getBorderClassName = (duration?: LeaveStates): string => {
    if (!duration) return "";

    switch (duration) {
      case LeaveStates.MORNING:
        return "half-day-morning-border";
      case LeaveStates.EVENING:
        return "half-day-evening-border";
      case LeaveStates.FULL_DAY:
        return "full-day-border";
      default:
        return "";
    }
  };

  const headers = useMemo(() => {
    return getHeadersWithSubtitles({
      translateText,
      recordData,
      getHolidaysArrayByDate
    });
  }, [recordData, getHolidaysArrayByDate, translateText]);

  const rows = useMemo(() => {
    if (
      !isRecordLoading &&
      recordData !== undefined &&
      recordData?.items !== undefined &&
      recordData?.items?.length > 0
    ) {
      const data = recordData?.items.map(
        (record: TimeRecordDataType, index: number) => {
          const employeeData = record?.employee?.employee;
          const timesheetData = record?.timeRecords;

          const totalWorkedHours = timeConfigData?.[0]?.totalHours ?? 0;

          const columns = timesheetData.reduce(
            (
              acc: Record<string, JSX.Element | number | undefined>,
              timeSheetRecord: TimeRecordType
            ) => {
              const hasNotWorkedAllHours =
                timeSheetRecord?.workedHours < totalWorkedHours;

              const dateAsISOString = convertYYYYMMDDToDateTime(
                timeSheetRecord.date
              ).toJSDate();

              const hasHolidays =
                getHolidaysArrayByDate(dateAsISOString).length > 0;

              const workedHours =
                formatDuration(timeSheetRecord?.workedHours) ?? "";

              let data = (
                <HtmlChip
                  text={workedHours}
                  customStyles={{
                    text: {
                      fontSize: "12px",
                      lineHeight: "16px",
                      border: "none",
                      padding: "4px 16px",
                      backgroundColor: hasNotWorkedAllHours
                        ? theme.palette.error.light
                        : ""
                    }
                  }}
                />
              );

              if (hasHolidays) {
                data = (
                  <HtmlChip
                    text={timeSheetRecord?.workedHours ? workedHours : "-"}
                    customStyles={{
                      text: {
                        fontSize: "12px",
                        lineHeight: "16px",
                        border: "none",
                        padding: "4px 16px",
                        backgroundColor: theme.palette.grey[100]
                      }
                    }}
                  />
                );
              }

              if (timeSheetRecord.leaveRequest !== null) {
                data = (
                  <HtmlChip
                    text={timeSheetRecord.leaveRequest?.leaveType?.name ?? ""}
                    emoji={getEmoji(
                      timeSheetRecord.leaveRequest?.leaveType?.emojiCode ?? ""
                    )}
                    className={getBorderClassName(
                      timeSheetRecord.leaveRequest?.leaveState
                    )}
                    customStyles={{
                      text: {
                        fontSize: "0.75rem",
                        lineHeight: "1rem",
                        padding: "4px 16px 4px 3px"
                      }
                    }}
                  />
                );
              }

              acc[timeSheetRecord.date] = data;
              return acc;
            },
            {}
          );

          // console.log("columns", columns);

          return {
            name: (
              <AvatarChip
                firstName={employeeData?.firstName ?? ""}
                lastName={employeeData?.lastName ?? ""}
                avatarUrl={employeeData?.authPic}
                isResponsiveLayout={true}
                chipStyles={{
                  maxWidth: "fit-content",
                  justifyContent: "flex-start"
                }}
                mediumScreenWidth={1024}
                smallScreenWidth={0}
              />
            ),
            ...columns
          };
        }
      );

      return data;
    }

    return [];
  }, [recordData, isRecordLoading, getHolidaysArrayByDate, translateText]);

  return (
    <Table
      tableName={TableNames.ALL_TIMESHEETS}
      headers={headers}
      rows={rows}
      tableFoot={{
        pagination: {
          isEnabled: recordData?.totalPages > 1,
          totalPages: recordData?.totalPages,
          currentPage: timesheetAnalyticsParams?.page,
          onChange: (event: ChangeEvent<unknown>, page: number) => {
            setTimesheetAnalyticsPagination(page - 1);
          }
        },
        exportBtn: {
          isLoading: isExportRecordDataLoading,
          isVisible: true,
          disabled: false,
          label: translateText(["exportToCsvBtnTxt"]),
          onClick: () =>
            downloadManagerTimesheetCsv(
              exportRecordData,
              timesheetAnalyticsParams?.startDate,
              timesheetAnalyticsParams?.endDate,
              teamName,
              orgName
            )
        }
      }}
    />
  );
};

export default EmployeeTimeRecordsTable;
