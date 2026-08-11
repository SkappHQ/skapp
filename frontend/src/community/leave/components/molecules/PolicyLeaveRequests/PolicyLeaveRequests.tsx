import { FC, useMemo } from "react";

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
import { useGetMyPolicyLeaveRequestsPage } from "~community/leave/api/PolicyLeaveApi";
import LeaveRequestDates from "~community/leave/components/molecules/LeaveRequestDates/LeaveRequestDates";
import PolicyLeaveErrorState from "~community/leave/components/molecules/PolicyLeaveErrorState/PolicyLeaveErrorState";
import PolicyLeaveRequestFilterBody from "~community/leave/components/molecules/PolicyLeaveRequestFilterBody/PolicyLeaveRequestFilterBody";
import PolicyEmployeeLeaveStatusPopupController from "~community/leave/components/organisms/PolicyEmployeeLeaveStatusPopupController/PolicyEmployeeLeaveStatusPopupController";
import { LEAVE_REQUESTS_SKELETON_ROWS } from "~community/leave/constants/stringConstants";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveRequestType } from "~community/leave/types/PolicyLeaveTypes";
import { leaveStatusIconSelector } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyLeaveRequestQueryParams } from "~community/leave/utils/policyLeave/policyLeaveUtils";

const CHIP_CLASSES =
  "inline-flex w-fit items-center gap-2 rounded-[9.375rem] bg-tertiary-background px-4 py-2";

const PolicyLeaveRequests: FC = () => {
  const { selectedYear, requestParams, setRequestPage, setRequestSortKey } =
    usePolicyLeaveStore((state) => state);

  const openEmployeeModal = usePolicyLeaveReviewStore(
    (state) => state.openEmployeeModal
  );

  const queryParams = useMemo(
    () => getPolicyLeaveRequestQueryParams(selectedYear, requestParams),
    [selectedYear, requestParams]
  );

  const {
    data: leaveRequests,
    isLoading,
    isError,
    isFetching,
    refetch
  } = useGetMyPolicyLeaveRequestsPage(queryParams);

  const filterCount =
    requestParams.status.length + requestParams.policyId.length;

  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator("leaveAria", "myRequests");

  const handleRetry = (): void => {
    refetch();
  };

  const tableHeaders: GridHeader[] = [
    {
      id: "duration",
      label: translateText(["myLeaveRequests", "duration"]).toLocaleUpperCase()
    },
    {
      id: "type",
      label: translateText(["myLeaveRequests", "type"]).toLocaleUpperCase()
    },
    {
      id: "policy",
      label: translateText(["myLeaveRequests", "policy"]).toLocaleUpperCase()
    },
    {
      id: "status",
      label: translateText(["myLeaveRequests", "status"]).toLocaleUpperCase()
    }
  ];

  const transformToTableRows = (): GridRow[] => {
    return (leaveRequests?.items ?? []).map(
      (leaveRequest: PolicyLeaveRequestType) => ({
        id: leaveRequest.leaveRequestId,
        duration: (
          <LeaveRequestDates
            days={leaveRequest.durationDays}
            startDate={leaveRequest.startDate}
            endDate={leaveRequest.endDate}
          />
        ),
        type: (
          <div className={CHIP_CLASSES}>
            <span role="img" aria-hidden="true">
              {getEmoji(leaveRequest.leaveType.emojiCode)}
            </span>
            {leaveRequest.leaveType.name}
          </div>
        ),
        policy: leaveRequest.policyName,
        status: (
          <div className={`${CHIP_CLASSES} capitalize`}>
            <span role="img" aria-hidden="true">
              {leaveStatusIconSelector(leaveRequest.status)}
            </span>
            {leaveRequest.status.toLowerCase()}
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

  const renderSelectedSortValue = (value?: string) => {
    const selectedOption = sortOptions.find((option) => option.value === value);

    return translateText(["myLeaveRequests", "sortBy"], {
      sortBy: selectedOption?.label ?? value
    });
  };

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <PolicyLeaveRequestFilterBody onClose={onClose} />
  );

  const handleRowClick = (row: GridRow): void => {
    openEmployeeModal(Number(row.id));
  };

  const handleSortChange = (value: string): void => {
    setRequestSortKey(value as SortKeyTypes);
  };

  if (isError) {
    return (
      <>
        <h2 className="h2 my-4">
          {translateText(["myLeaveRequests", "requestTitle"])}
        </h2>
        <PolicyLeaveErrorState
          message={translateText(["myLeaveRequests", "errorState", "message"])}
          retryLabel={translateText(["myLeaveRequests", "errorState", "retry"])}
          onRetry={handleRetry}
          isRetrying={isFetching}
        />
      </>
    );
  }

  return (
    <>
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
        skeletonRows={LEAVE_REQUESTS_SKELETON_ROWS}
        emptyState={{
          title: translateText(["myLeaveRequests", "emptyLeaveRequestTitle"]),
          description: translateText([
            "myLeaveRequests",
            "emptyLeaveRequestDes"
          ])
        }}
        onRowClick={handleRowClick}
        pagination={{
          totalPages: leaveRequests?.totalPages,
          currentPage: requestParams.page,
          onPageChange: setRequestPage
        }}
        toolbar={{
          dropdown: {
            id: "my-policy-leave-requests-sort",
            options: sortOptions,
            value: requestParams.sortKey,
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
          popoverId: "my-policy-leave-requests-filter",
          filterContent: renderFilterContent
        }}
      />
      <PolicyEmployeeLeaveStatusPopupController />
    </>
  );
};

export default PolicyLeaveRequests;
