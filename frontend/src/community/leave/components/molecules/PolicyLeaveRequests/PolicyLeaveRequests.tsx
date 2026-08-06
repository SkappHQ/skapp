import { FC } from "react";

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
import { useSearchMyPolicyLeaveRequests } from "~community/leave/api/PolicyLeaveApi";
import LeaveRequestDates from "~community/leave/components/molecules/LeaveRequestDates/LeaveRequestDates";
import PolicyLeaveRequestFilterBody from "~community/leave/components/molecules/PolicyLeaveRequestFilterBody/PolicyLeaveRequestFilterBody";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveRequestType } from "~community/leave/types/PolicyLeaveTypes";
import { leaveStatusIconSelector } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

import styles from "./styles";

const PolicyLeaveRequests: FC = () => {
  const classes = styles();

  const selectedYear = usePolicyLeaveStore((state) => state.selectedYear);
  const requestParams = usePolicyLeaveStore((state) => state.requestParams);
  const setRequestPage = usePolicyLeaveStore((state) => state.setRequestPage);
  const setRequestSortKey = usePolicyLeaveStore(
    (state) => state.setRequestSortKey
  );

  const { data: leaveRequests, isLoading } = useSearchMyPolicyLeaveRequests(
    selectedYear,
    requestParams
  );

  const filterCount =
    requestParams.status.length + requestParams.policyId.length;

  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator("leaveAria", "myRequests");

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
          <div style={classes.iconStyles}>
            <span role="img" aria-hidden="true">
              {getEmoji(leaveRequest.leaveType?.emojiCode || "")}
            </span>
            {leaveRequest.leaveType?.name}
          </div>
        ),
        policy: leaveRequest.policyName,
        status: (
          <div style={{ ...classes.iconStyles, textTransform: "capitalize" }}>
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

  const renderFilterContent = ({ close }: TableViewFilterContentArgs) => (
    <PolicyLeaveRequestFilterBody onClose={close} />
  );

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
          onChange: (value: string) => setRequestSortKey(value as SortKeyTypes),
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
  );
};

export default PolicyLeaveRequests;
