import { type Theme, useTheme } from "@mui/material/styles";
import { LocationPinIcon, Tooltip } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, useEffect, useMemo, useRef, useState } from "react";

import { useGetDailyLogsByEmployeeId } from "~community/attendance/api/AttendanceEmployeeApi";
import { useGetManagerTimeRecords } from "~community/attendance/api/attendanceManagerApi";
import { RecordLocationStatus } from "~community/attendance/enums/timesheetEnums";
import useManualEntryRestriction from "~community/attendance/hooks/useManualEntryRestriction";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  DailyLogType,
  DirectEntryEmployeeType,
  TimeRecordDataResponseType,
  TimeRecordDataType,
  TimeRecordType
} from "~community/attendance/types/timeSheetTypes";
import {
  getBorderClassName,
  getHeadersWithSubtitles,
  getHolidayDurationType
} from "~community/attendance/utils/AllTimeSheetTableUtils";
import {
  createEmptyDailyLog,
  formatDuration,
  getTimeEntryModalType
} from "~community/attendance/utils/TimeUtils";
import { downloadManagerTimesheetCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import HtmlChip from "~community/common/components/atoms/Chips/HtmlChip/HtmlChip";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/HtmlTable/Table";
import { TOAST_AUTO_HIDE_DURATION } from "~community/common/constants/commonConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import useGetHoliday from "~community/common/hooks/useGetHoliday";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmployeeFullName } from "~community/common/utils/commonUtil";
import {
  convertYYYYMMDDToDateTime,
  formatDateWithOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { getEmoji } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

interface PendingDirectEntryCell extends DirectEntryEmployeeType {
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
  const translateAria = useTranslator(
    "attendanceAria",
    "timesheet",
    "employeeTimeRecordsTable"
  );

  const theme: Theme = useTheme();

  const {
    timesheetAnalyticsParams,
    setTimesheetAnalyticsPagination,
    setSelectedDailyRecord,
    setDirectEntryEmployee,
    setEmployeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen
  } = useAttendanceStore((state) => ({
    timesheetAnalyticsParams: state.timesheetAnalyticsParams,
    setTimesheetAnalyticsPagination: state.setTimesheetAnalyticsPagination,
    setSelectedDailyRecord: state.setSelectedDailyRecord,
    setDirectEntryEmployee: state.setDirectEntryEmployee,
    setEmployeeTimesheetModalType: state.setEmployeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen: state.setIsEmployeeTimesheetModalOpen
  }));

  const { isFetching: isExportRecordDataLoading, refetch: refetchExportData } =
    useGetManagerTimeRecords(true);

  const { data: timeConfigData } = useDefaultCapacity();

  const { getHolidaysArrayByDate } = useGetHoliday();

  const { canDirectlyAddOrEditEntry } = useManualEntryRestriction();

  const { setToastMessage } = useToast();

  const [pendingCell, setPendingCell] = useState<PendingDirectEntryCell | null>(
    null
  );

  const {
    data: pendingDayLogs,
    isFetching: isPendingDayFetching,
    isSuccess: isPendingDaySuccess,
    isError: isPendingDayError
  } = useGetDailyLogsByEmployeeId(
    pendingCell?.date ?? "",
    pendingCell?.date ?? "",
    pendingCell?.employeeId ?? 0,
    Boolean(pendingCell)
  );

  // useTranslator returns a new function on every render, so it is held in a ref
  // instead of being listed as a dependency below.
  // The effect opens a modal through the attendance store, and this component is
  // subscribed to that whole store, so the resulting re-render can re-enter the
  // effect before the setPendingCell(null) above has been flushed. This records
  // the cell that has already been handled so it is only ever acted on once.
  const handledCellRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingCell) {
      handledCellRef.current = null;
      return;
    }

    const cellKey = `${pendingCell.employeeId}-${pendingCell.date}`;
    if (handledCellRef.current === cellKey || isPendingDayFetching) return;

    if (isPendingDayError) {
      handledCellRef.current = cellKey;
      setPendingCell(null);
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["addTimeEntryErrorTitle"]),
        description: translateText(["directEntryDayLoadErrorDes"]),
        autoHideDuration: TOAST_AUTO_HIDE_DURATION
      });
      return;
    }

    // A newly enabled query reports isFetching false for the render before the
    // request starts, so the day is only read once this cell's fetch has settled.
    if (!isPendingDaySuccess) return;

    const dayRecord =
      pendingDayLogs?.find(
        (log: DailyLogType) => log.date === pendingCell.date
      ) ?? createEmptyDailyLog(pendingCell.date);

    const modalType = getTimeEntryModalType(dayRecord);

    handledCellRef.current = cellKey;
    setPendingCell(null);
    if (modalType === null) return;

    setDirectEntryEmployee({
      employeeId: pendingCell.employeeId,
      employeeName: pendingCell.employeeName
    });
    setSelectedDailyRecord(dayRecord);
    setEmployeeTimesheetModalType(modalType);
    setIsEmployeeTimesheetModalOpen(true);
  }, [
    pendingCell,
    pendingDayLogs,
    isPendingDayFetching,
    isPendingDaySuccess,
    isPendingDayError
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

            if (canDirectlyAddOrEditEntry && !isFutureDate) {
              const employeeId = employeeData?.employeeId;
              const employeeName = getEmployeeFullName(
                employeeData?.firstName,
                employeeData?.lastName
              );

              if (employeeId) {
                const openDirectEntry = () =>
                  setPendingCell({
                    employeeId,
                    employeeName,
                    date: timeSheetRecord.date
                  });

                const isCellLoading =
                  pendingCell?.employeeId === employeeId &&
                  pendingCell?.date === timeSheetRecord.date;

                finalCellData = (
                  <button
                    type="button"
                    aria-label={translateAria(["directEntryCellLabel"], {
                      employeeName,
                      date: formatDateWithOrdinalIndicator(
                        new Date(timeSheetRecord.date)
                      )
                    })}
                    aria-busy={isCellLoading}
                    disabled={isCellLoading}
                    className={`flex w-full items-center justify-center border-0 bg-transparent p-0 text-inherit ${
                      isCellLoading
                        ? "cursor-wait opacity-50"
                        : "cursor-pointer"
                    }`}
                    onClick={openDirectEntry}
                  >
                    {finalCellData}
                  </button>
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
    translateAria,
    canDirectlyAddOrEditEntry,
    pendingCell
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
