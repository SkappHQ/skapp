import { Box } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
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
import { useGetPolicyManagerLeaveRequests } from "~community/leave/api/PolicyLeaveReviewApi";
import RequestDates from "~community/leave/components/molecules/LeaveRequestRow/RequestDates";
import PolicyManagerLeaveRequestFilterBody from "~community/leave/components/molecules/PolicyManagerLeaveRequestFilterBody/PolicyManagerLeaveRequestFilterBody";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { PolicyManagerLeaveRequestType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { requestTypeSelector } from "~community/leave/utils/LeaveRequestFilterActions";
import { generateManagerLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";
import { getStartEndDate } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyManagerLeaveRequestQueryParams } from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";

const chipClassName =
  "inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-background px-4 py-2";

const PolicyManagerLeaveRequests: FC = () => {
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

  const requestParams = usePolicyLeaveReviewStore(
    (state) => state.requestParams
  );
  const setRequestPage = usePolicyLeaveReviewStore(
    (state) => state.setRequestPage
  );
  const setRequestSortKey = usePolicyLeaveReviewStore(
    (state) => state.setRequestSortKey
  );
  const setRequestDateRange = usePolicyLeaveReviewStore(
    (state) => state.setRequestDateRange
  );
  const setRequestStatusFilter = usePolicyLeaveReviewStore(
    (state) => state.setRequestStatusFilter
  );
  const openManagerModal = usePolicyLeaveReviewStore(
    (state) => state.openManagerModal
  );

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const queryParams = useMemo(
    () => getPolicyManagerLeaveRequestQueryParams(requestParams),
    [requestParams]
  );

  const { data: leaveRequests, isLoading } =
    useGetPolicyManagerLeaveRequests(queryParams);

  const employeeLeaveRequests = leaveRequests?.items ?? [];
  const totalPages = leaveRequests?.totalPages;
  const currentPage = requestParams.page;

  const isDateRangeApplied = Boolean(
    selectedDateRange?.from && selectedDateRange?.to
  );

  const filterCount =
    requestParams.status.length +
    requestParams.leaveTypeId.length +
    (isDateRangeApplied ? 1 : 0);

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
    return employeeLeaveRequests.map(
      (employeeLeaveRequest: PolicyManagerLeaveRequestType) => ({
        id: employeeLeaveRequest.leaveRequestId,
        ariaLabel: generateManagerLeaveRequestAriaLabel(translateAria, {
          ...employeeLeaveRequest,
          leaveRequestDates: getStartEndDate(
            employeeLeaveRequest.startDate,
            employeeLeaveRequest.endDate
          )
        }),
        name: (
          <Box
            role="group"
            aria-label={`${employeeLeaveRequest.employee.firstName} ${employeeLeaveRequest.employee.lastName}`}
          >
            <Box aria-hidden={true}>
              <AvatarChip
                firstName={employeeLeaveRequest.employee.firstName}
                lastName={employeeLeaveRequest.employee.lastName}
                avatarUrl={employeeLeaveRequest.employee.authPic ?? ""}
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
            days={getAsDaysString(employeeLeaveRequest.durationDays)}
            dates={getStartEndDate(
              employeeLeaveRequest.startDate,
              employeeLeaveRequest.endDate
            )}
          />
        ),
        type: (
          <div className={chipClassName}>
            <span role="img" aria-hidden="true">
              {getEmoji(employeeLeaveRequest.leaveType.emojiCode)}
            </span>
            {employeeLeaveRequest.leaveType.name}
          </div>
        ),
        status: (
          <div className={`${chipClassName} capitalize`}>
            <span role="img" aria-hidden="true">
              {requestTypeSelector(employeeLeaveRequest.status)}
            </span>
            {employeeLeaveRequest.status.toLowerCase()}
          </div>
        )
      })
    );
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

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <PolicyManagerLeaveRequestFilterBody
      onClose={onClose}
      selectedDateRange={selectedDateRange}
      onDateRangeChange={setSelectedDateRange}
    />
  );

  const handleSortChange = (value: string): void => {
    setRequestSortKey(value as SortKeyTypes);
  };

  const handleRowClick = (row: GridRow): void => {
    openManagerModal(Number(row.id));
  };

  // The store outlives the page, so the status filter is seeded on every entry the way
  // the legacy page did it.
  useEffect(() => {
    setRequestStatusFilter([PolicyLeaveRequestStatus.PENDING]);
  }, [setRequestStatusFilter]);

  useEffect(() => {
    const selectedStartDate = selectedDateRange?.from
      ? convertDateToFormat(selectedDateRange.from, DATE_FORMAT)
      : getDateForPeriod("year", "start");
    const selectedEndDate = selectedDateRange?.to
      ? convertDateToFormat(selectedDateRange.to, DATE_FORMAT)
      : getDateForPeriod("year", "end");

    setRequestDateRange(selectedStartDate, selectedEndDate);
  }, [selectedDateRange, setRequestDateRange]);

  useEffect(() => {
    if (employeeLeaveRequests?.length === 0 && totalPages === 0) {
      if (currentPage !== 0) {
        setRequestPage(currentPage - 1);
      }
    }
  }, [currentPage, employeeLeaveRequests?.length, setRequestPage, totalPages]);

  return (
    <TableView
      tableName={TableNames.MANAGER_LEAVE_REQUESTS}
      ariaLabel={{
        regionAriaLabel: translateAria(["allLeaveRequestTable"])
      }}
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      skeletonRows={LEAVE_REQUESTS_SKELETON_ROWS}
      emptyState={{
        title: translateText(["noLeaveRequests"]),
        description: translateText(["noLeaveRequestsManagerDetails"])
      }}
      onRowClick={handleRowClick}
      pagination={{
        totalPages,
        currentPage,
        onPageChange: setRequestPage
      }}
      toolbar={{
        dropdown: {
          id: "all-leave-requests-sort",
          options: sortOptions,
          value: requestParams.sortKey,
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

export default PolicyManagerLeaveRequests;
