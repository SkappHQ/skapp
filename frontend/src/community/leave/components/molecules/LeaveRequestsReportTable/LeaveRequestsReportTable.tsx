import { Box, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { FC, JSX, useCallback, useEffect, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import FilterButton from "~community/common/components/molecules/FilterButton/FilterButton";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import Table from "~community/common/components/molecules/Table/Table";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveRequestStates } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getRecentYearsInStrings } from "~community/common/utils/dateTimeUtils";
import {
  useGetEmployeeLeaveReportCSV,
  useGetEmployeeLeaveRequestsReport
} from "~community/leave/api/LeaveReportApi";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { SheetType } from "~community/leave/enums/LeaveReportEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { downloadDataAsCSV } from "~community/leave/utils/leaveReport/exportReportUtils";

const LeaveRequestsReportTable: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveReports");

  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const {
    reportsParams,
    setReportsParams,
    setReportsFilter,
    setReportsFilterOrder,
    setReportsFilterOrderIds,
    setReportsPagination,
    resetReportsParams,
    resetReportsFilter,
    resetReportsFilterOrder,
    resetReportsFilterOrderIds
  } = useLeaveStore();

  const { data: leaveRequests, isLoading } = useGetEmployeeLeaveRequestsReport(
    reportsParams.year,
    reportsParams.teamId,
    reportsParams.page,
    reportsParams.size,
    reportsParams.sortKey,
    reportsParams.sortOrder,
    reportsParams.leaveTypeId,
    reportsParams.leaveStatus
  );

  const headerLabels: string[] = [
    "Member",
    "Team",
    "Leave Type",
    "Days",
    "Start Date",
    "End Date"
  ];

  const reportData = useGetEmployeeLeaveReportCSV(
    reportsParams.year,
    reportsParams.leaveTypeId,
    reportsParams.teamId,
    headerLabels,
    reportsParams.leaveStatus
  );

  const { data: leaveTypes } = useGetLeaveTypes();

  const years = getRecentYearsInStrings();

  const leaveTypeButtons = useMemo(() => {
    return Array.isArray(leaveTypes)
      ? leaveTypes
          .filter((leaveType) => leaveType?.isActive)
          .map((leaveType) => ({
            id: leaveType?.typeId?.toString(),
            text: leaveType?.name
          }))
      : [];
  }, [leaveTypes]);

  useEffect(() => {
    return () => {
      resetReportsParams();
      resetReportsFilter();
      resetReportsFilterOrder();
      resetReportsFilterOrderIds();
    };
  }, [
    resetReportsFilter,
    resetReportsFilterOrder,
    resetReportsFilterOrderIds,
    resetReportsParams
  ]);

  const columns = useMemo(
    () => [
      { field: "member", headerName: translateText(["memberColumn"]) },
      {
        field: "leavePeriod",
        headerName: translateText(["leavePeriodColumn"])
      },
      { field: "leaveType", headerName: translateText(["leaveTypeColumn"]) },
      { field: "status", headerName: translateText(["statusColumn"]) }
    ],
    [translateText]
  );

  const tableHeaders = useMemo(
    () => columns.map((col) => ({ id: col.field, label: col.headerName })),
    [columns]
  );

  const handleYearClick = (event: SelectChangeEvent): void => {
    setReportsParams("year", event.target.value);
  };

  const yearFilter = (
    <RoundedSelect
      id="leave-reports-table-year-filter"
      onChange={handleYearClick}
      value={reportsParams.year}
      options={years}
    />
  );

  const requestTypeSelector = (status: string): JSX.Element => {
    switch (status) {
      case LeaveRequestStates.PENDING:
        return <Icon name={IconName.PENDING_STATUS_ICON} />;
      case LeaveRequestStates.APPROVED:
        return <Icon name={IconName.APPROVED_STATUS_ICON} />;
      case LeaveRequestStates.DENIED:
        return <Icon name={IconName.DENIED_STATUS_ICON} />;
      case LeaveRequestStates.CANCELLED:
        return <Icon name={IconName.CANCELLED_STATUS_ICON} />;
      default:
        return <></>;
    }
  };

  const transformToTableRows = useCallback(() => {
    return (
      leaveRequests?.data?.results[0]?.items?.map((leaveRequest: any) => {
        return {
          id: leaveRequest?.employeeId,
          member: (
            <AvatarChip
              firstName={leaveRequest?.firstName}
              lastName={leaveRequest?.lastName}
              avatarUrl={leaveRequest?.authPic}
            />
          ),
          leavePeriod: (
            <Stack direction="row" gap={"0.8rem"}>
              <Typography variant="body1" sx={{ mt: "0.375rem" }}>
                {leaveRequest?.startDate !== leaveRequest?.endDate ? (
                  <>
                    {leaveRequest?.startDate} to {leaveRequest?.endDate}
                  </>
                ) : (
                  leaveRequest?.startDate
                )}
              </Typography>
              <BasicChip
                label={"4 days"}
                chipStyles={{
                  backgroundColor: "white"
                }}
              />
            </Stack>
          ),
          leaveType: (
            <IconChip
              icon={leaveRequest.leaveTypeEmoji}
              label={leaveRequest.leaveType}
            />
          ),
          status: (
            <Typography variant="body2" color="textSecondary">
              <IconChip
                label={leaveRequest?.status?.toLowerCase()}
                icon={requestTypeSelector(leaveRequest?.status)}
                isResponsive={true}
                isTruncated={false}
                mediumScreenWidth={1024}
              />
            </Typography>
          )
        };
      }) || []
    );
  }, [leaveRequests?.data?.results]);

  const leaveStatusButtons = [
    { id: LeaveRequestStates.PENDING, text: translateText(["pending"]) },
    { id: LeaveRequestStates.APPROVED, text: translateText(["approved"]) },
    { id: LeaveRequestStates.DENIED, text: translateText(["denied"]) },
    { id: LeaveRequestStates.CANCELLED, text: translateText(["cancelled"]) }
  ];

  const handleLeaveTypeFilter = (leaveType: { id: string; text: string }) => {
    const updatedTypes = selectedLeaveTypes.includes(leaveType.text)
      ? selectedLeaveTypes.filter((type) => type !== leaveType.text)
      : [...selectedLeaveTypes, leaveType.text];

    setSelectedLeaveTypes(updatedTypes);

    const updatedTypeIds = leaveTypeButtons
      .filter((button) => updatedTypes.includes(button.text))
      .map((button) => button.id);

    setReportsFilter("leaveType", updatedTypeIds);
    setReportsFilterOrder(updatedTypes);
    setReportsFilterOrderIds(updatedTypeIds);
  };

  const handleRemoveLeaveTypes = (leaveType: { id: string; text: string }) => {
    const updatedTypes = selectedLeaveTypes.includes(leaveType.text)
      ? selectedLeaveTypes.filter((type) => type !== leaveType.text)
      : [...selectedLeaveTypes, leaveType.text];

    setSelectedLeaveTypes(updatedTypes);

    const updatedTypeIds = leaveTypeButtons
      .filter((button) => updatedTypes.includes(button.text))
      .map((button) => button.id);

    setReportsFilter("leaveType", updatedTypeIds);
    setReportsFilterOrder(updatedTypes);
    setReportsFilterOrderIds(updatedTypeIds);

    setReportsParams("leaveTypeId", updatedTypeIds);
  };

  const handleStatusFilter = (status: { id: string; text: string }) => {
    const updatedStatuses = selectedStatuses.includes(status.text)
      ? selectedStatuses.filter((type) => type !== status.text)
      : [...selectedStatuses, status.text];

    setSelectedStatuses(updatedStatuses);

    const updatedStatusIds = leaveStatusButtons
      .filter((button) => updatedStatuses.includes(button.text))
      .map((button) => button.id);

    setReportsFilter("status", updatedStatusIds);
  };

  const handleRemoveLeaveStatues = (status: { id: string; text: string }) => {
    const updatedStatuses = selectedStatuses.includes(status.text)
      ? selectedStatuses.filter((type) => type !== status.text)
      : [...selectedStatuses, status.text];

    setSelectedStatuses(updatedStatuses);

    const updatedStatusIds = leaveStatusButtons
      .filter((button) => updatedStatuses.includes(button.text))
      .map((button) => button.id);

    setReportsFilter("status", updatedStatusIds);

    setReportsParams("leaveStatus", updatedStatuses);
  };

  const handleApplyFilters = () => {
    if (selectedLeaveTypes.length === 1) {
      const selectedTypeId = leaveTypeButtons.find(
        (button) => button.text === selectedLeaveTypes[0]
      )?.id;
      setReportsParams("leaveTypeId", selectedTypeId || selectedLeaveTypes[0]);
    } else {
      const selectedTypeIds = selectedLeaveTypes
        .map(
          (type) => leaveTypeButtons.find((button) => button.text === type)?.id
        )
        .filter(Boolean);
      setReportsParams("leaveTypeId", selectedTypeIds);
    }

    if (selectedStatuses.length === 1) {
      const selectedStatusId = leaveStatusButtons.find(
        (button) => button.text === selectedStatuses[0]
      )?.id;
      setReportsParams("leaveStatus", selectedStatusId || selectedStatuses[0]);
    } else {
      const selectedStatusIds = selectedStatuses
        .map(
          (status) =>
            leaveStatusButtons.find((button) => button.text === status)?.id
        )
        .filter(Boolean);
      setReportsParams("leaveStatus", selectedStatusIds);
    }

    setReportsParams("page", 0);
  };

  const handleResetFilters = (): void => {
    setSelectedLeaveTypes([]);
    setSelectedStatuses([]);
    resetReportsParams();
    resetReportsFilter();
    resetReportsFilterOrder();
    resetReportsFilterOrderIds();
  };

  const getAllSelectedFilters = () => {
    return [
      ...selectedLeaveTypes.map((type) => ({
        filter: [type],
        handleFilterDelete: () => {
          handleRemoveLeaveTypes({
            id: leaveTypeButtons.find((btn) => btn.text === type)?.id || "",
            text: type
          });
        }
      })),
      ...selectedStatuses.map((status) => ({
        filter: [status],
        handleFilterDelete: () => {
          handleRemoveLeaveStatues({
            id: leaveStatusButtons.find((btn) => btn.text === status)?.id || "",
            text: status
          });
        }
      }))
    ];
  };

  const filterButton = (
    <FilterButton
      handleApplyBtnClick={handleApplyFilters}
      handleResetBtnClick={handleResetFilters}
      selectedFilters={getAllSelectedFilters()}
      position={"bottom-end"}
      id={"filter-types"}
      isResetBtnDisabled={
        selectedLeaveTypes.length === 0 && selectedStatuses.length === 0
      }
    >
      <Typography variant="h5">
        {translateText(["filterPopperLeaveStatusTitle"])}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {leaveStatusButtons.map((status) => (
          <Button
            key={status.id}
            isFullWidth={false}
            label={status.text}
            buttonStyle={
              selectedStatuses.includes(status.text)
                ? ButtonStyle.SECONDARY
                : ButtonStyle.TERTIARY
            }
            onClick={() => handleStatusFilter(status)}
            startIcon={
              selectedStatuses.includes(status.text) ? (
                <Icon name={IconName.CHECK_CIRCLE_ICON} />
              ) : undefined
            }
            styles={{
              p: "0.5rem 0.75rem",
              textTransform: "capitalize",
              lineHeight: "1.3125rem",
              height: "2rem",
              ml: "0.4rem",
              mb: "0.8rem"
            }}
          />
        ))}
      </Box>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {translateText(["filterPopperLeaveTypeTitle"])}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {leaveTypeButtons.map((leaveType) => (
          <Button
            key={leaveType.id}
            isFullWidth={false}
            label={leaveType.text}
            buttonStyle={
              selectedLeaveTypes.includes(leaveType.text)
                ? ButtonStyle.SECONDARY
                : ButtonStyle.TERTIARY
            }
            onClick={() => handleLeaveTypeFilter(leaveType)}
            startIcon={
              selectedLeaveTypes.includes(leaveType.text) ? (
                <Icon name={IconName.CHECK_CIRCLE_ICON} />
              ) : undefined
            }
            styles={{
              p: "0.5rem 0.75rem",
              textTransform: "capitalize",
              lineHeight: "1.3125rem",
              height: "2rem",
              ml: "0.4rem",
              mb: "0.8rem"
            }}
          />
        ))}
      </Box>
    </FilterButton>
  );

  const downloadCSV = (reportType: SheetType) => {
    if (reportData) {
      downloadDataAsCSV(reportData, headerLabels, reportType);
    }
  };

  return (
    <Box>
      <Table
        tableName={TableNames.LEAVE_REQUESTS_REPORT}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText(["emptyScreenTitle"]),
              description: translateText(["emptyScreenDescription"])
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
            totalPages: leaveRequests?.data?.results[0]?.totalPages || 1,
            currentPage: reportsParams.page,
            onChange: (_, value) => setReportsPagination(value - 1)
          },
          exportBtn: {
            label: translateText(["exportBtnTxt"]),
            onClick: () => downloadCSV(SheetType.LeaveRequests),
            isVisible: true
          }
        }}
        customStyles={{
          container: {
            maxHeight: "40rem"
          }
        }}
        actionToolbar={{
          firstRow: {
            leftButton: yearFilter,
            rightButton: filterButton
          }
        }}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default LeaveRequestsReportTable;
