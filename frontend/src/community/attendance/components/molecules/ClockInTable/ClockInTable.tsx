import { Box, Stack, Typography } from "@mui/material";
import { SxProps, type Theme, useTheme } from "@mui/material/styles";
import { DateTime } from "luxon";
import { useAuth } from "~community/common/context/AuthContext";
import { useRouter } from "next/router";
import { Dispatch, FC, SetStateAction, useEffect, useRef } from "react";

import { TIME_FORMAT_AM_PM } from "~community/attendance/constants/constants";
import { ClockInSummaryTypes } from "~community/attendance/enums/dashboardEnums";
import FilterButton from "~community/common/components/molecules/AdvancedFilterButton/AdvancedFilterButton";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { testPassiveEventSupport } from "~community/common/utils/commonUtil";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";

import EmojiChip from "../../atoms/EmojiChip/EmojiChip";

interface Props {
  clockInData: any[];
  fetchNextPage: () => void;
  isFetching?: boolean;
  isFetchingNextPage?: boolean;
  onSearch: boolean;
  hasNextPage?: boolean;
  selectedFilters: { [key: string]: (string | number)[] };
  setSelectedFilters: Dispatch<
    SetStateAction<{ [key: string]: (string | number)[] }>
  >;
  selectedDate: Date[];
  setSelectedDate: Dispatch<SetStateAction<Date[]>>;
  setIsFetchEnable: Dispatch<SetStateAction<boolean>>;
}

const ClockInTable: FC<Props> = ({
  clockInData,
  fetchNextPage,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  setSelectedFilters,
  selectedDate,
  selectedFilters,
  setSelectedDate,
  setIsFetchEnable
}) => {
  const theme: Theme = useTheme();
  const { data } = useAuth();
  const router = useRouter();
  const translateTexts = useTranslator("attendanceModule");

  const {
    isPendingInvitationListOpen,
    setIsFromPeopleDirectory,
    setViewEmployeeId
  } = usePeopleStore((state) => state);

  const { data: teamData } = useGetAllTeams();
  const teamFilter = teamData?.map((item) => ({
    label: item.teamName,
    value: item.teamId
  }));

  const listInnerRef = useRef<HTMLDivElement>();
  const supportsPassive = testPassiveEventSupport();

  const tableHeadStyles = {
    borderTopLeftRadius: "0.625rem",
    borderTopRightRadius: "0.625rem"
  };

  const tableHeaderCellStyles = {
    border: "none"
  };

  const tableContainerStyles = {
    borderRadius: "0.625rem",
    overflow: "auto"
  };

  const columns = [
    {
      field: "name",
      headerName: translateTexts([
        "dashboards.attendanceDashboard.clockInTableHeaders.name"
      ])
    },
    {
      field: "clockInTime",
      headerName: translateTexts([
        "dashboards.attendanceDashboard.clockInTableHeaders.clockIn"
      ])
    },
    {
      field: "clockOutTime",
      headerName: translateTexts([
        "dashboards.attendanceDashboard.clockInTableHeaders.clockOut"
      ])
    },
    {
      field: "workedHours",
      headerName: translateTexts([
        "dashboards.attendanceDashboard.clockInTableHeaders.workedHours"
      ])
    }
  ];

  const tableHeaders = columns?.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = () => {
    return clockInData?.map((data) => ({
      id: data?.employee?.employeeId,
      name: (
        <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
          <AvatarChip
            firstName={data?.employee?.firstName ?? ""}
            lastName={data?.employee?.lastName ?? ""}
            avatarUrl={data?.employee?.authPic}
            isResponsiveLayout={true}
            chipStyles={{
              color: data?.employee?.isActive
                ? "common.black"
                : theme.palette.grey[700],
              maxWidth: "12.625rem",
              "& .MuiChip-label": {
                pr: "0.3rem"
              }
            }}
          />
        </Stack>
      ),
      clockInTime: (
        <>
          {data?.clockInTime ? (
            <>
              {data?.leave ? (
                <EmojiChip
                  name={data?.clockInTime}
                  emoji={data?.leave?.emojiCode}
                  circleSize={1}
                  leaveType={data?.leave?.leaveState}
                />
              ) : (
                <Typography>
                  {DateTime.fromFormat(data?.clockInTime, TIME_FORMAT_AM_PM, {
                    zone: "utc"
                  })
                    .toLocal()
                    .toFormat(TIME_FORMAT_AM_PM)}
                </Typography>
              )}
              {data?.isLateArrival && (
                <Box
                  sx={{
                    background: theme.palette.error.light,
                    py: 0.5,
                    px: 1,
                    borderRadius: "1.5rem",
                    color: theme.palette.error.contrastText,
                    ml: 1
                  }}
                >
                  {translateTexts([
                    "dashboards.attendanceDashboard.clockInTableSummary.lateArrival"
                  ])}
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                background: theme.palette.grey[100],
                py: 0.5,
                px: 1,
                borderRadius: "1.5rem",
                color: theme.palette.text.secondary
              }}
            >
              {translateTexts([
                "dashboards.attendanceDashboard.clockInTableSummary.notClockedIn"
              ])}
            </Box>
          )}
        </>
      ),
      clockOutTime: (
        <>
          {data?.clockOutTime ? (
            <Typography>
              {DateTime.fromFormat(data?.clockOutTime, TIME_FORMAT_AM_PM, {
                zone: "utc"
              })
                .toLocal()
                .toFormat(TIME_FORMAT_AM_PM)}
            </Typography>
          ) : (
            <>-</>
          )}
        </>
      ),
      workedHours: data?.workedHours ?? "-"
    }));
  };

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight;
      if (isNearBottom && !isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    }
  };

  useEffect(() => {
    const listInnerElement = listInnerRef.current;

    if (!isFetchingNextPage && listInnerElement) {
      listInnerElement.addEventListener(
        "touchmove",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      listInnerElement?.addEventListener(
        "wheel",
        onScroll,
        supportsPassive ? { passive: true } : false
      );

      return () => {
        listInnerElement?.removeEventListener("touchmove", onScroll);
        listInnerElement?.removeEventListener("wheel", onScroll);
      };
    }
  }, [isFetchingNextPage, hasNextPage]);

  const filterData = {
    "Clock-ins": [
      {
        label: translateTexts([
          "dashboards.attendanceDashboard.clockInTableSummary.lateArrivals"
        ]),
        value: ClockInSummaryTypes.LATE_CLOCK_INS
      },
      {
        label: translateTexts([
          "dashboards.attendanceDashboard.clockInTableSummary.notClockedIns"
        ]),
        value: ClockInSummaryTypes.NOT_CLOCKED_INS
      }
    ],
    Teams: teamFilter
  };

  const handleApplyFilters = (selectedFilters: {
    [key: string]: (string | number)[];
  }) => {
    setSelectedFilters(selectedFilters);
    setIsFetchEnable(true);
  };

  const handleResetFilters = () => {
    setIsFetchEnable(true);
    setSelectedFilters({});
  };

  return (
    <Box
      sx={{
        mt: isPendingInvitationListOpen ? "1.5rem" : "0rem",
        backgroundColor: theme.palette.grey[100],
        display: "flex",
        flexDirection: "column",
        borderRadius: "0.5rem",
        gap: "0.125rem"
      }}
    >
      <Box ref={listInnerRef}>
        <Table
          tableName={TableNames.CLOCK_IN}
          headers={tableHeaders}
          isLoading={isFetching}
          rows={transformToTableRows()}
          tableHead={{
            customStyles: {
              row: tableHeadStyles,
              cell: tableHeaderCellStyles
            }
          }}
          tableBody={{
            emptyState: {
              noData: {
                title: translateTexts([
                  "dashboards.attendanceDashboard.clockInTableSummary.noDataTitle"
                ]),
                description: translateTexts([
                  "dashboards.attendanceDashboard.clockInTableSummary.noDataDescription"
                ])
              }
            },
            loadingState: {
              skeleton: {
                rows: 5
              }
            }
          }}
          actionToolbar={{
            firstRow: {
              leftButton: (
                <Box display={"flex"} justifyContent="space-between" gap="1rem">
                  <Typography>
                    {translateTexts(["timesheet.dateInputLabel"])}
                  </Typography>
                  <DateRangePicker
                    isRangePicker={false}
                    setSelectedDates={setSelectedDate}
                    selectedDates={selectedDate}
                    chipStyles={
                      {
                        border: `1px solid ${theme.palette.grey[500]}`
                      } as SxProps
                    }
                  />
                </Box>
              ),
              rightButton: (
                <FilterButton
                  filterTypes={filterData}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                  setSelectedFilters={setSelectedFilters}
                  selectedFilters={selectedFilters}
                />
              )
            }
          }}
          tableFoot={{
            pagination: {
              isEnabled: false
            }
          }}
          customStyles={{
            wrapper: {
              overflow: "hidden"
            },
            container: tableContainerStyles
          }}
        />
      </Box>
    </Box>
  );
};

export default ClockInTable;
