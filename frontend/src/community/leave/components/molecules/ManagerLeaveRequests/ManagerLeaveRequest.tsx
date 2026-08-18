import { Box } from "@mui/material";
import { FC, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow,
  TableViewFilterContentArgs
} from "~community/common/components/organisms/TableView/types";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortKeyTypes } from "~community/common/types/CommonTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  convertDateToFormat,
  getAsDaysString,
  getDateForPeriod
} from "~community/common/utils/dateTimeUtils";
import { useGetLeaveRequestData } from "~community/leave/api/LeaveApi";
import RequestDates from "~community/leave/components/molecules/LeaveRequestRow/RequestDates";
import ManagerLeaveRequestFilterBody from "~community/leave/components/molecules/ManagerLeaveRequestFilterBody/ManagerLeaveRequestFilterBody";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveRequestItemsType,
  leaveRequestRowDataTypes
} from "~community/leave/types/LeaveRequestTypes";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import { requestTypeSelector } from "~community/leave/utils/LeaveRequestFilterActions";
import { generateManagerLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";

const chipClassName =
  "inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-background px-4 py-2";

interface Props {
  employeeLeaveRequests: LeaveRequestItemsType[];
  totalPages?: number;
  isLoading?: boolean;
}

const ManagerLeaveRequest: FC<Props> = ({
  totalPages,
  employeeLeaveRequests,
  isLoading
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestTable"
  );

  const translateSortText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestSort"
  );

  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const translateCommonAria = useTranslator("commonAria", "components");

  const {
    setLeaveRequestParams,
    setPagination,
    handleLeaveRequestsSort,
    setIsManagerModal,
    setLeaveRequestData,
    setNewLeaveId,
    newLeaveId,
    leaveRequestParams,
    leaveRequestsFilter
  } = useLeaveStore((state) => ({
    resetLeaveRequestParams: state.resetLeaveRequestParams,
    leaveRequestFilterOrder: state.leaveRequestFilterOrder,
    setLeaveRequestParams: state.setLeaveRequestParams,
    setPagination: state.setPagination,
    handleLeaveRequestsSort: state.handleLeaveRequestsSort,
    setIsManagerModal: state.setIsManagerModal,
    setLeaveRequestData: state.setLeaveRequestData,
    setNewLeaveId: state.setNewLeaveId,
    newLeaveId: state.newLeaveId,
    leaveRequestParams: state.leaveRequestParams,
    leaveRequestsFilter: state.leaveRequestsFilter
  }));

  const currentPage = useLeaveStore((state) => state.leaveRequestParams.page);

  const leaveRequestSort = leaveRequestParams.sortKey;

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const appliedStatus = leaveRequestsFilter.status as LeaveStatusTypes[];
  const appliedTypes = leaveRequestsFilter.type;
  const appliedFilterCount = appliedStatus.length + appliedTypes.length;

  const isDateRangeApplied = Boolean(
    selectedDateRange?.from && selectedDateRange?.to
  );

  const filterCount = appliedFilterCount + (isDateRangeApplied ? 1 : 0);

  const {
    refetch,
    isSuccess: getLeaveByIdSuccess,
    data: getLeaveByIdData
  } = useGetLeaveRequestData(newLeaveId as number);

  const columns = [
    { field: "name", headerName: translateText(["name"]) },
    { field: "duration", headerName: translateText(["duration"]) },
    { field: "type", headerName: translateText(["type"]) },
    { field: "status", headerName: translateText(["status"]) }
  ];

  const tableHeaders: GridHeader[] = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = (): GridRow[] => {
    return employeeLeaveRequests.map((employeeLeaveRequest) => ({
      id: employeeLeaveRequest.leaveRequestId,
      ariaLabel: generateManagerLeaveRequestAriaLabel(
        translateAria,
        employeeLeaveRequest
      ),
      name: (
        <Box
          role="group"
          aria-label={`${employeeLeaveRequest?.employee?.firstName} ${employeeLeaveRequest?.employee?.lastName}`}
        >
          <Box aria-hidden={true}>
            <AvatarChip
              firstName={employeeLeaveRequest?.employee?.firstName ?? ""}
              lastName={employeeLeaveRequest?.employee?.lastName ?? ""}
              avatarUrl={employeeLeaveRequest?.employee?.authPic ?? ""}
              isResponsiveLayout
              chipStyles={{
                width: "fit-content",
                maxWidth: "15.625rem",
                justifyContent: "flex-start",
                backgroundColor: "var(--color-tertiary-background)"
              }}
            />
          </Box>
        </Box>
      ),
      duration: (
        <RequestDates
          days={getAsDaysString(employeeLeaveRequest?.durationDays ?? "")}
          dates={employeeLeaveRequest?.leaveRequestDates}
        />
      ),
      type: (
        <div className={chipClassName}>
          <span role="img" aria-hidden="true">
            {getEmoji(employeeLeaveRequest?.leaveType?.emojiCode || "")}
          </span>
          {employeeLeaveRequest?.leaveType?.name}
        </div>
      ),
      status: (
        <div className={`${chipClassName} capitalize`}>
          <span role="img" aria-hidden="true">
            {requestTypeSelector(employeeLeaveRequest?.status)}
          </span>
          {employeeLeaveRequest?.status.toLowerCase()}
        </div>
      )
    }));
  };

  const sortOptions = [
    {
      id: SortKeyTypes.CREATED_DATE,
      label: translateSortText(["dateRequested"]),
      value: SortKeyTypes.CREATED_DATE
    },
    {
      id: SortKeyTypes.START_DATE,
      label: translateSortText(["leaveDate"]),
      value: SortKeyTypes.START_DATE
    }
  ];

  const handleSortChange = (value: string) => {
    handleLeaveRequestsSort("sortKey", value);
  };

  const renderSelectedSortValue = (value?: string) => {
    const selectedOption = sortOptions.find((option) => option.value === value);

    return (
      <span
        aria-label={translateAria(["sortBy"], {
          sortBy: selectedOption?.label
        })}
      >
        {translateSortText(["sortBy"])}
      </span>
    );
  };

  const handleRowClick = (row: GridRow): void => {
    setIsManagerModal(false);
    setLeaveRequestData({} as leaveRequestRowDataTypes);
    setNewLeaveId(Number(row.id));
  };

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <ManagerLeaveRequestFilterBody
      onClose={onClose}
      selectedDateRange={selectedDateRange}
      onDateRangeChange={setSelectedDateRange}
    />
  );

  useEffect(() => {
    setLeaveRequestParams("size", "6");

    const selectedStartDate = selectedDateRange?.from
      ? convertDateToFormat(selectedDateRange.from, DATE_FORMAT)
      : getDateForPeriod("year", "start");
    const selectedEndDate = selectedDateRange?.to
      ? convertDateToFormat(selectedDateRange.to, DATE_FORMAT)
      : getDateForPeriod("year", "end");

    setLeaveRequestParams("startDate", selectedStartDate);
    setLeaveRequestParams("endDate", selectedEndDate);
  }, [appliedStatus, appliedTypes, selectedDateRange, setLeaveRequestParams]);

  useEffect(() => {
    if (employeeLeaveRequests?.length === 0 && totalPages === 0) {
      if (currentPage !== 0) {
        setPagination(currentPage - 1);
      }
    }
  }, [currentPage, employeeLeaveRequests?.length, setPagination, totalPages]);

  useEffect(() => {
    if (getLeaveByIdSuccess && getLeaveByIdData) {
      setLeaveRequestData(getLeaveByIdData);
    }
  }, [getLeaveByIdData, getLeaveByIdSuccess]);

  useEffect(() => {
    if (newLeaveId) {
      refetch()
        .then(() => setIsManagerModal(true))
        .catch(console.error);
    }
  }, [newLeaveId]);

  return (
    <TableView
      tableName={TableNames.MANAGER_LEAVE_REQUESTS}
      ariaLabel={{
        regionAriaLabel: translateAria(["allLeaveRequestTable"])
      }}
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      skeletonRows={5}
      emptyState={{
        title: translateText(["noLeaveRequests"]),
        description: translateText(["noLeaveRequestsManagerDetails"])
      }}
      onRowClick={handleRowClick}
      pagination={{
        totalPages,
        currentPage,
        onPageChange: setPagination
      }}
      toolbar={{
        dropdown: {
          id: "all-leave-requests-sort",
          options: sortOptions,
          value: leaveRequestSort,
          onChange: handleSortChange,
          renderSelectedValue: renderSelectedSortValue,
          width: "auto",
          menuWidth: "content",
          ariaLabel: translateAria(["sort"])
        }
      }}
      filter={{
        filterCount,
        filterButtonAriaLabel: translateCommonAria(["filterBtn"]),
        popoverId: "all-leave-requests-filter",
        filterContent: renderFilterContent
      }}
    />
  );
};

export default ManagerLeaveRequest;
