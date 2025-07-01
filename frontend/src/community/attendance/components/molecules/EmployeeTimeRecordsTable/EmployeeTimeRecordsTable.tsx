import { type Theme, useTheme } from "@mui/material/styles";
import { ChangeEvent, JSX, useMemo } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  TimeRecordDataResponseType,
  TimeRecordDataType,
  TimeRecordType
} from "~community/attendance/types/timeSheetTypes";
import {
  getBorderClassName,
  getHeadersWithSubtitles,
  getHolidayDurationType
} from "~community/attendance/utils/AllTimeSheetTableUtils";
import { formatDuration } from "~community/attendance/utils/TimeUtils";
import { downloadManagerTimesheetCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import HtmlChip from "~community/common/components/atoms/Chips/HtmlChip/HtmlChip";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/HtmlTable/Table";
import { TableNames } from "~community/common/enums/Table";
import useGetHoliday from "~community/common/hooks/useGetHoliday";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { convertYYYYMMDDToDateTime } from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { getEmoji } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

interface Props {
  recordData: TimeRecordDataResponseType;
  exportRecordData: TimeRecordDataResponseType;
  orgName?: string;
  teamName?: string;
  isRecordLoading?: boolean;
  isExportRecordDataLoading?: boolean;
}

const EmployeeTimeRecordsTable = ({
  recordData,
  exportRecordData,
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
      const data = recordData?.items.map((record: TimeRecordDataType) => {
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

            const isFutureDate = dateAsISOString > new Date();

            const holidays = getHolidaysArrayByDate(dateAsISOString);

            const hasHolidays =
              getHolidaysArrayByDate(dateAsISOString).length > 0;

            const holidayDuration = getHolidayDurationType(holidays);

            const workedHours =
              formatDuration(timeSheetRecord?.workedHours) ?? "";

            let text = isFutureDate ? "-" : workedHours;

            let data = (
              <HtmlChip
                text={text}
                customStyles={{
                  text: {
                    border: "none",
                    backgroundColor:
                      !isFutureDate && hasNotWorkedAllHours
                        ? theme.palette.error.light
                        : ""
                  }
                }}
              />
            );

            if (hasHolidays) {
              const isHalfDayHoliday =
                holidayDuration === HolidayDurationType.HALFDAY_EVENING ||
                holidayDuration === HolidayDurationType.HALFDAY_MORNING;

              if (isHalfDayHoliday) {
                text = isFutureDate ? "-" : workedHours;
              } else {
                text = timeSheetRecord?.workedHours ? workedHours : "-";
              }

              data = (
                <HtmlChip
                  text={text}
                  className={getBorderClassName(true, holidayDuration)}
                  customStyles={{
                    text: {
                      border: "none",
                      backgroundColor: theme.palette.grey[100]
                    }
                  }}
                />
              );
            }

            if (timeSheetRecord.leaveRequest !== null) {
              if (isFutureDate) {
                text = timeSheetRecord.leaveRequest?.leaveType?.name ?? "-";
              } else if (timeSheetRecord.leaveRequest?.leaveType?.name) {
                text = timeSheetRecord?.workedHours
                  ? workedHours
                  : timeSheetRecord.leaveRequest.leaveType.name;
              } else if (timeSheetRecord?.workedHours) {
                text = workedHours;
              } else {
                text = "-";
              }

              data = (
                <HtmlChip
                  text={text}
                  emoji={getEmoji(
                    timeSheetRecord.leaveRequest?.leaveType?.emojiCode ?? ""
                  )}
                  className={getBorderClassName(
                    false,
                    timeSheetRecord.leaveRequest?.leaveState
                  )}
                />
              );
            }

            acc[timeSheetRecord.date] = data;
            return acc;
          },
          {}
        );

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
      });

      return data;
    }

    return [];
  }, [
    recordData,
    isRecordLoading,
    theme,
    timeConfigData,
    getHolidaysArrayByDate,
    translateText
  ]);

  return (
    <Table
      tableName={TableNames.ALL_TIMESHEETS}
      loadingState={{
        isLoading: isRecordLoading
      }}
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
