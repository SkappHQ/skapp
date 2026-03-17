import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { SelectableItemList } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import FilterButton from "~community/common/components/molecules/FilterButton/FilterButton";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { pascalCaseFormatter } from "~community/common/utils/commonUtil";
import {
  convertDateToFormat,
  formatDateRange,
  getAsDaysString,
  getDateForPeriod
} from "~community/common/utils/dateTimeUtils";
import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import {
  Employee,
  LeaveHistoryDataTypes,
  LeaveHistoryRowType
} from "~community/leave/types/TeamLeaveAnalyticsTypes";
import { downloadDataAsCSVTeam } from "~community/leave/utils/TeamLeaveAnalyticsUtils";
import { leaveStatusIconSelector } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

import RequestDates from "../LeaveRequestRow/RequestDates";
import MultiselectEmployeeFilter from "../MultiselectEmployeeFilter/MultiselectEmployeeFilter";

interface Props {
  leaveHistory: LeaveHistoryDataTypes;
  currentPage: number;
  isLoading: boolean;
  teamDetails: Employee[];
}

const TeamAnalyticsLeaveHistoryTable: FC<Props> = ({
  leaveHistory,
  currentPage,
  isLoading,
  teamDetails
}) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("leaveModule", "analytics");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isAll, setIsAll] = useState<boolean>(true);
  const [filter, setFilter] = useState<{ status: string[]; type: string[] }>({
    status: [],
    type: []
  });
  const { data: leaveTypesData } = useGetLeaveTypes();

  const {
    resetTeamLeaveAnalyticsParams,
    setTeamLeaveAnalyticsParams,
    setTeamLeaveAnalyticsPagination,
    setTeamLeaveAnalyticSelectedDates
  } = useLeaveStore((state) => state);

  const columns = [
    { field: "member", headerName: translateText(["member"]) },
    { field: "leavePeriod", headerName: translateText(["leavePeriod"]) },
    { field: "type", headerName: translateText(["type"]) },
    { field: "status", headerName: translateText(["status"]) }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = () => {
    return leaveHistory?.items.map(
      (leaveData: LeaveHistoryRowType, index: number) => ({
        id: index,
        member: (
          <AvatarChip
            avatarUrl={leaveData?.employeeResponseDto?.authPic}
            firstName={leaveData?.employeeResponseDto?.firstName ?? ""}
            lastName={leaveData?.employeeResponseDto?.lastName ?? ""}
            isResponsiveLayout={true}
            isTooltipEnabled={true}
            chipStyles={{
              cursor: "pointer",
              color: "common.black",
              filter: null,
              justifySelf: "flex-start"
            }}
          />
        ),
        leavePeriod: (
          <RequestDates
            days={getAsDaysString(
              leaveData?.leaveRequestResponseDto?.durationDays
            )}
            dates={formatDateRange(
              new Date(leaveData?.leaveRequestResponseDto?.startDate),
              new Date(leaveData?.leaveRequestResponseDto?.endDate),
              false,
              leaveData?.leaveRequestResponseDto?.durationDays
            )}
          />
        ),
        type: (
          <IconChip
            icon={leaveData?.leaveRequestResponseDto?.leaveType?.emojiCode}
            label={leaveData?.leaveRequestResponseDto?.leaveType?.name}
            isResponsive={true}
            chipStyles={{
              color: "common.black",
              height: "2.25rem",
              gap: "0rem",
              px: "0.625rem"
            }}
          />
        ),
        status: (
          <IconChip
            label={pascalCaseFormatter(
              leaveData?.leaveRequestResponseDto?.status
            )}
            icon={leaveStatusIconSelector(
              leaveData?.leaveRequestResponseDto?.status
            )}
            chipStyles={{
              color: theme.palette.text.secondary,
              marginRight: 0
            }}
            isResponsive={true}
          />
        )
      })
    );
  };

  const dateRangePicker = (
    <>
      <Stack direction={"row"} alignItems={"center"}>
        <DateRangePicker
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
        <Stack direction={"row"} alignItems={"center"}>
          <Typography
            variant="body2"
            sx={{
              pr: "0.625rem"
            }}
          >
            {translateText(["teamMember"])} :
          </Typography>
          <MultiselectEmployeeFilter
            teamDetails={teamDetails}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
            isAll={isAll}
            setIsAll={setIsAll}
          />
        </Stack>
      </Stack>
    </>
  );

  useEffect(() => {
    setTeamLeaveAnalyticsParams("teamMemberIds", selectedMembers.map(String));
  }, [selectedMembers]);

  useEffect(() => {
    const startDate = getDateForPeriod("year", "start");
    const endDate = getDateForPeriod("year", "end");

    const selectedStartDate = selectedDates[0]
      ? convertDateToFormat(selectedDates[0], "yyyy-MM-dd")
      : startDate;
    const selectedEndDate = selectedDates[1]
      ? convertDateToFormat(selectedDates[1], "yyyy-MM-dd")
      : endDate;

    setTeamLeaveAnalyticSelectedDates([selectedStartDate, selectedEndDate]);
  }, [selectedDates, setTeamLeaveAnalyticSelectedDates]);

  const leaveTypeOptions = useMemo(
    () =>
      leaveTypesData?.map((leaveType) => ({
        id: leaveType.typeId.toString(),
        name: leaveType.name
      })) || [],
    [leaveTypesData]
  );

  const getLeaveTypeNameById = (id: string) => {
    const leaveType = leaveTypeOptions.find(
      (type: { id: string; name: string }) => type.id === id
    );
    return leaveType ? leaveType.name : null;
  };

  const handleApplyFilters = () => {
    setTeamLeaveAnalyticsParams("status", filter.status);
    setTeamLeaveAnalyticsParams("leaveType", filter.type);
  };

  const handleResetFilters = () => {
    setFilter({
      status: [],
      type: []
    });
    resetTeamLeaveAnalyticsParams();
  };

  const leaveStatusArray = [
    LeaveStatusTypes.PENDING,
    LeaveStatusTypes.APPROVED,
    LeaveStatusTypes.DENIED,
    LeaveStatusTypes.REVOKED,
    LeaveStatusTypes.CANCELLED
  ];

  const filterButton = (
    <FilterButton
      handleApplyBtnClick={handleApplyFilters}
      handleResetBtnClick={handleResetFilters}
      selectedFilters={[
        {
          filter: filter.type.map((typeId) => getLeaveTypeNameById(typeId)),
          handleFilterDelete: (option) => {
            const updatedTypeFilter = filter.type.filter(
              (item) => getLeaveTypeNameById(item) !== option
            );
            setFilter((prev) => ({
              ...prev,
              type: updatedTypeFilter
            }));
            setTeamLeaveAnalyticsParams("leaveType", updatedTypeFilter);
          }
        },
        {
          filter: filter.status,
          handleFilterDelete: (option) => {
            const updatedStatusFilter = filter.status.filter(
              (item) => item !== option
            );
            setFilter((prev) => ({
              ...prev,
              status: updatedStatusFilter
            }));
            setTeamLeaveAnalyticsParams("status", updatedStatusFilter);
          }
        }
      ]}
      position={"bottom-end"}
      id={"filter-types"}
      isResetBtnDisabled={!filter.type.length && !filter.status.length}
    >
      <SelectableItemList
        title={translateText(["filterButtonStatus"])}
        items={leaveStatusArray.map((leaveStatus) => ({
          label: pascalCaseFormatter(leaveStatus),
          value: leaveStatus
        }))}
        selectedValues={filter.status}
        onChipClick={(statusValue) => {
          setFilter((prev) => ({
            ...prev,
            status: prev.status.includes(statusValue)
              ? prev.status.filter((item) => item !== statusValue)
              : [...prev.status, statusValue]
          }));
        }}
      />

      <SelectableItemList
        title={translateText(["filterButtonType"])}
        items={leaveTypeOptions.map(({ id, name }) => ({
          label: name,
          value: id
        }))}
        selectedValues={filter.type}
        onChipClick={(typeId) => {
          setFilter((prev) => ({
            ...prev,
            type: prev.type.includes(typeId)
              ? prev.type.filter((item) => item !== typeId)
              : [...prev.type, typeId]
          }));
        }}
      />
    </FilterButton>
  );

  const handleExport = () => {
    setTeamLeaveAnalyticsParams("page", "0");
    setTeamLeaveAnalyticsParams("isExport", "true");
    downloadDataAsCSVTeam({
      data: leaveHistory?.items
    });
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          marginBottom: "1.5rem",
          marginTop: "1.5rem"
        }}
      >
        {translateText(["tableTitle"])}
      </Typography>
      <Table
        tableName={TableNames.TEAM_ANALYTICS_LEAVE_HISTORY}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText(["emptyHistoryTitle"]),
              description: translateText(["emptyHistoryDescription"])
            }
          },
          loadingState: {
            skeleton: {
              rows: 5
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: true,
            totalPages: leaveHistory?.totalPages,
            currentPage: currentPage as number,
            onChange: (_event: ChangeEvent<unknown>, value: number) =>
              setTeamLeaveAnalyticsPagination(value - 1)
          },
          exportBtn: {
            label: translateText(["exportBtnTxt"]),
            onClick: handleExport
          }
        }}
        actionToolbar={{
          firstRow: {
            leftButton: dateRangePicker,
            rightButton: filterButton
          }
        }}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default TeamAnalyticsLeaveHistoryTable;
