import { type Theme, useTheme } from "@mui/material/styles";
import { LocationPinIcon, Tooltip } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, useEffect, useMemo, useState } from "react";

import { useGetDailyLogsByEmployeeId } from "~community/attendance/api/AttendanceEmployeeApi";
import { useGetManagerTimeRecords } from "~community/attendance/api/attendanceManagerApi";
import {
  EmployeeTimesheetModalTypes,
  RecordLocationStatus
} from "~community/attendance/enums/timesheetEnums";
import useManualEntryRestriction from "~community/attendance/hooks/useManualEntryRestriction";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  DailyLogType,
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

interface PendingDirectEntryCell {
  employeeId: number;
  employeeName: string;
  date: string;
}

interface Props {
  recordData: TimeRecordDataResponseType;
  orgName?: string;
  teamName?: string;
  isRecordLoading?: boolean;
}

const EmployeeTimeRecordsTable = ({
  recordData,
  orgName,
  teamName,
  isRecordLoading
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const theme: Theme = useTheme();

  const { timesheetAnalyticsParams, setTimesheetAnalyticsPagination } =
    useAttendanceStore((state) => state);

  const { isFetching: isExportRecordDataLoading, refetch: refetchExportData } =
    useGetManagerTimeRecords(true);

  const { data: timeConfigData } = useDefaultCapacity();

  const { getHolidaysArrayByDate } = useGetHoliday();

  const { canDirectlyAddOrEditEntry } = useManualEntryRestriction();

  const {
    setSelectedDailyRecord,
    setDirectEntryEmployee,
    setEmployeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen
  } = useAttendanceStore((state) => state);

  const [pendingCell, setPendingCell] = useState<PendingDirectEntryCell | null>(
    null
  );

  const { data: pendingDayLogs } = useGetDailyLogsByEmployeeId(
    pendingCell?.date ?? "",
    pendingCell?.date ?? "",
    pendingCell?.employeeId ?? 0,
    Boolean(pendingCell)
  );

  useEffect(() => {
    if (!pendingCell || !pendingDayLogs) return;

    const dayRecord = pendingDayLogs?.find(
      (log: DailyLogType) => log.date === pendingCell.date
    );

    setDirectEntryEmployee({
      employeeId: pendingCell.employeeId,
      employeeName: pendingCell.employeeName
    });
    setSelectedDailyRecord(
      dayRecord ?? ({ date: pendingCell.date } as DailyLogType)
    );
    setEmployeeTimesheetModalType(
      dayRecord?.timeRecordId && dayRecord?.timeSlots?.length
        ? EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY
        : EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    );
    setIsEmployeeTimesheetModalOpen(true);
    setPendingCell(null);
  }, [
    pendingCell,
    pendingDayLogs,
    setDirectEntryEmployee,
    setSelectedDailyRecord,
    setEmployeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen
  ]);

  const headers = useMemo(() => {
    return getHeadersWithSubtitles({
      translateText,
      recordData,
      getHolidaysArrayByDate
    });
  }, [recordData, getHolidaysArrayByDate, translateText]);

  const getLocationMessage = (
    status: RecordLocationStatus | undefined
  ): string => {
    if (status === RecordLocationStatus.INSIDE)
      return translateText(["locationInsideWorkLocation"]);
    if (status === RecordLocationStatus.OUTSIDE)
      return translateText(["locationOutsideWorkLocation"]);
    return translateText(["locationUnavailable"]);
  };

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

            const showLocationPin =
              timeSheetRecord.clockInLocationStatus ===
                RecordLocationStatus.OUTSIDE ||
              timeSheetRecord.clockOutLocationStatus ===
                RecordLocationStatus.OUTSIDE ||
              timeSheetRecord.clockInLocationStatus ===
                RecordLocationStatus.UNAVAILABLE ||
              timeSheetRecord.clockOutLocationStatus ===
                RecordLocationStatus.UNAVAILABLE;

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

            let finalCellData = data;
            if (showLocationPin) {
              const locationTooltipTitle = translateText(
                ["locationPinTooltip"],
                {
                  clockIn: getLocationMessage(
                    timeSheetRecord.clockInLocationStatus
                  ),
                  clockOut: getLocationMessage(
                    timeSheetRecord.clockOutLocationStatus
                  )
                }
              );

              finalCellData = (
                <div className="flex flex-row items-center justify-center gap-1">
                  {data}
                  <Tooltip content={locationTooltipTitle}>
                    <LocationPinIcon
                      role="img"
                      aria-label={locationTooltipTitle}
                    />
                  </Tooltip>
                </div>
              );
            }

            // While the restriction is on, an authorized role turns each day cell into
            // a direct add/edit entry point for the employee on that row.
            if (canDirectlyAddOrEditEntry && !isFutureDate) {
              const employeeId = employeeData?.employeeId;
              const employeeName = [
                employeeData?.firstName,
                employeeData?.lastName
              ]
                .filter(Boolean)
                .join(" ");

              if (employeeId) {
                const openDirectEntry = () =>
                  setPendingCell({
                    employeeId,
                    employeeName,
                    date: timeSheetRecord.date
                  });

                finalCellData = (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={translateText(["directEntryCellLabel"], {
                      employeeName,
                      date: timeSheetRecord.date
                    })}
                    className="cursor-pointer"
                    onClick={openDirectEntry}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDirectEntry();
                      }
                    }}
                  >
                    {finalCellData}
                  </div>
                );
              }
            }

            acc[timeSheetRecord.date] = finalCellData;
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
    translateText,
    canDirectlyAddOrEditEntry
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
          onClick: async () => {
            const { data: exportRecordData } = await refetchExportData();
            if (exportRecordData) {
              downloadManagerTimesheetCsv(
                exportRecordData,
                timesheetAnalyticsParams?.startDate,
                timesheetAnalyticsParams?.endDate,
                teamName,
                orgName
              );
            }
          }
        }
      }}
    />
  );
};

export default EmployeeTimeRecordsTable;
