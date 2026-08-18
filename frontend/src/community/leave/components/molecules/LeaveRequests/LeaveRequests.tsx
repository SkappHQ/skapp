import { FC, useEffect } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow,
  TableViewFilterContentArgs
} from "~community/common/components/organisms/TableView/types";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortKeyTypes } from "~community/common/types/CommonTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useGetEmployeeLeaveRequestData,
  useGetEmployeeLeaveRequests
} from "~community/leave/api/MyRequestApi";
import MyLeaveRequestFilterBody from "~community/leave/components/molecules/MyLeaveRequestFilterBody/MyLeaveRequestFilterBody";
import { MY_LEAVE_REQUESTS_PER_PAGE } from "~community/leave/constants/stringConstants";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveRequestDataType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { generateMyLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";
import { leaveStatusIconSelector } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

import LeaveRequestDates from "../LeaveRequestDates/LeaveRequestDates";
import styles from "./styles";

const LeaveRequests: FC = () => {
  const classes = styles();

  const { status, leaveType, page, sortKey } = useLeaveStore(
    (state) => state.leaveRequestParams
  );
  const {
    setPagination,
    handleLeaveRequestsSort,
    setIsEmployeeModal,
    setEmployeeLeaveRequestData,
    newLeaveId,
    setNewLeaveId,
    leaveRequestsFilter
  } = useLeaveStore((state) => state);

  const { data: leaveRequests, isLoading } = useGetEmployeeLeaveRequests({
    status,
    leaveType,
    page,
    sortKey,
    size: MY_LEAVE_REQUESTS_PER_PAGE
  });

  const {
    refetch,
    isSuccess,
    data: leaveData
  } = useGetEmployeeLeaveRequestData(newLeaveId as number);

  const filterCount =
    leaveRequestsFilter.status.length + leaveRequestsFilter.type.length;

  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator("leaveAria", "myRequests");

  useEffect(() => {
    if (isSuccess && leaveData) {
      setEmployeeLeaveRequestData(leaveData);
    }
  }, [isSuccess, leaveData]);

  const columns = [
    {
      field: "duration",
      headerName: translateText([
        "myLeaveRequests",
        "duration"
      ]).toLocaleUpperCase()
    },
    {
      field: "type",
      headerName: translateText(["myLeaveRequests", "type"]).toLocaleUpperCase()
    },
    {
      field: "status",
      headerName: translateText([
        "myLeaveRequests",
        "status"
      ]).toLocaleUpperCase()
    }
  ];

  const tableHeaders: GridHeader[] = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = (): GridRow[] => {
    return (leaveRequests?.items ?? []).map(
      (employeeLeaveRequest: LeaveRequestDataType) => ({
        id: employeeLeaveRequest.leaveRequestId,
        ariaLabel: generateMyLeaveRequestAriaLabel(
          translateAria,
          translateText,
          employeeLeaveRequest
        ),
        duration: (
          <LeaveRequestDates
            days={employeeLeaveRequest.durationDays}
            startDate={employeeLeaveRequest.startDate}
            endDate={employeeLeaveRequest.endDate}
          />
        ),
        type: (
          <div style={classes.iconStyles}>
            <span role="img" aria-hidden="true">
              {getEmoji(employeeLeaveRequest.leaveType.emojiCode || "")}
            </span>
            {employeeLeaveRequest.leaveType.name}
          </div>
        ),
        status: (
          <div style={{ ...classes.iconStyles, textTransform: "capitalize" }}>
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
      label: translateText(["myLeaveRequests", "dateRequested"]),
      value: SortKeyTypes.CREATED_DATE
    },
    {
      id: SortKeyTypes.START_DATE,
      label: translateText(["myLeaveRequests", "leaveDate"]),
      value: SortKeyTypes.START_DATE
    }
  ];

  const handleSortChange = (value: string) => {
    handleLeaveRequestsSort("sortKey", value);
  };

  const renderSelectedSortValue = (value?: string) => {
    const selectedOption = sortOptions.find((option) => option.value === value);

    return translateText(["myLeaveRequests", "sortBy"], {
      sortBy: selectedOption?.label ?? value
    });
  };

  const handleRowClick = (row: GridRow): void => {
    setIsEmployeeModal(false);
    setEmployeeLeaveRequestData({} as LeaveRequestDataType);
    setNewLeaveId(Number(row.id));
  };

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <MyLeaveRequestFilterBody onClose={onClose} />
  );

  useEffect(() => {
    if (newLeaveId) {
      refetch()
        .then(() => {
          setIsEmployeeModal(true);
        })
        .catch(console.error);
    }
  }, [newLeaveId]);

  return (
    <TableView
      heading={translateText(["myLeaveRequests", "requestTitle"])}
      tableName={TableNames.LEAVE_REQUESTS}
      ariaLabel={{
        regionAriaLabel: translateAria([
          "myLeaveRequests",
          "myLeaveRequestsSection"
        ])
      }}
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      skeletonRows={5}
      emptyState={{
        title: translateText(["myLeaveRequests", "emptyLeaveRequestTitle"]),
        description: translateText(["myLeaveRequests", "emptyLeaveRequestDes"])
      }}
      onRowClick={handleRowClick}
      pagination={{
        totalPages: leaveRequests?.totalPages,
        currentPage: page,
        onPageChange: setPagination
      }}
      toolbar={{
        dropdown: {
          id: "my-leave-requests-sort",
          options: sortOptions,
          value: sortKey,
          onChange: handleSortChange,
          renderSelectedValue: renderSelectedSortValue,
          width: "auto",
          menuWidth: "content",
          ariaLabel: translateAria(["myLeaveRequests", "sort"])
        }
      }}
      filter={{
        filterCount,
        filterButtonAriaLabel: translateAria([
          "myLeaveRequests",
          "filterSection"
        ]),
        popoverId: "my-leave-requests-filter",
        filterContent: renderFilterContent
      }}
    />
  );
};

export default LeaveRequests;
