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
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
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
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyManagerLeaveRequestType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { generateManagerLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";
import {
  getStartEndDate,
  leaveStatusIconSelector
} from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyManagerLeaveRequestQueryParams } from "~community/leave/utils/policyLeave/policyLeaveReviewUtils";

const chipClassName =
  "inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-background px-4 py-2";

const PolicyManagerLeaveRequests: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveRequests");

  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const translateCommonAria = useTranslator("commonAria", "components");

  const {
    reviewRequestParams,
    setReviewRequestPage,
    setReviewRequestSortKey,
    setReviewRequestDateRange,
    setReviewRequestStatusFilter,
    openManagerModal
  } = usePolicyLeaveStore((state) => ({
    reviewRequestParams: state.reviewRequestParams,
    setReviewRequestPage: state.setReviewRequestPage,
    setReviewRequestSortKey: state.setReviewRequestSortKey,
    setReviewRequestDateRange: state.setReviewRequestDateRange,
    setReviewRequestStatusFilter: state.setReviewRequestStatusFilter,
    openManagerModal: state.openManagerModal
  }));

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const queryParams = useMemo(
    () => getPolicyManagerLeaveRequestQueryParams(reviewRequestParams),
    [reviewRequestParams]
  );

  const { data: leaveRequests, isLoading } = useGetPolicyManagerLeaveRequests(
    queryParams,
    Boolean(queryParams.startDate && queryParams.endDate)
  );

  const employeeLeaveRequests = leaveRequests?.items ?? [];
  const totalPages = leaveRequests?.totalPages;
  const currentPage = reviewRequestParams.page;

  const isDateRangeApplied = Boolean(
    selectedDateRange?.from && selectedDateRange?.to
  );

  const filterCount =
    reviewRequestParams.status.length +
    reviewRequestParams.leaveTypeId.length +
    (isDateRangeApplied ? 1 : 0);

  const columns = [
    { field: "name", headerName: translateText(["leaveRequestTable", "name"]) },
    {
      field: "duration",
      headerName: translateText(["leaveRequestTable", "duration"])
    },
    { field: "type", headerName: translateText(["leaveRequestTable", "type"]) },
    {
      field: "status",
      headerName: translateText(["leaveRequestTable", "status"])
    }
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
                  maxWidth: "100%",
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
              {leaveStatusIconSelector(employeeLeaveRequest.status)}
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
      label: translateText(["leaveRequestSort", "dateRequested"]),
      value: SortKeyTypes.CREATED_DATE
    },
    {
      id: SortKeyTypes.START_DATE,
      label: translateText(["leaveRequestSort", "leaveDate"]),
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
        {translateText(["leaveRequestSort", "sortBy"])}
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
    const sortKey = value as SortKeyTypes;

    setReviewRequestSortKey(
      sortKey,
      sortKey === SortKeyTypes.START_DATE
        ? SortOrderTypes.ASC
        : SortOrderTypes.DESC
    );
  };

  const handleRowClick = (row: GridRow): void => {
    openManagerModal(Number(row.id));
  };

  useEffect(() => {
    setReviewRequestStatusFilter([PolicyLeaveRequestStatus.PENDING]);
  }, [setReviewRequestStatusFilter]);

  useEffect(() => {
    const selectedStartDate = selectedDateRange?.from
      ? convertDateToFormat(selectedDateRange.from, DATE_FORMAT)
      : getDateForPeriod("year", "start");
    const selectedEndDate = selectedDateRange?.to
      ? convertDateToFormat(selectedDateRange.to, DATE_FORMAT)
      : getDateForPeriod("year", "end");

    setReviewRequestDateRange(selectedStartDate, selectedEndDate);
  }, [selectedDateRange, setReviewRequestDateRange]);

  useEffect(() => {
    if (employeeLeaveRequests?.length === 0 && totalPages === 0) {
      if (currentPage !== 0) {
        setReviewRequestPage(currentPage - 1);
      }
    }
  }, [
    currentPage,
    employeeLeaveRequests?.length,
    setReviewRequestPage,
    totalPages
  ]);

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
        title: translateText(["leaveRequestTable", "noLeaveRequests"]),
        description: translateText([
          "leaveRequestTable",
          "noLeaveRequestsManagerDetails"
        ])
      }}
      onRowClick={handleRowClick}
      pagination={{
        totalPages,
        currentPage,
        onPageChange: setReviewRequestPage
      }}
      toolbar={{
        dropdown: {
          id: "all-leave-requests-sort",
          options: sortOptions,
          value: reviewRequestParams.sortKey,
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
