import { Box, Stack } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/Table/Table";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useGetPolicyManagerLeaveRequests,
  useReviewPolicyLeaveRequest
} from "~community/leave/api/PolicyLeaveReviewApi";
import {
  UNPAGINATED_PAGE,
  UNPAGINATED_SIZE
} from "~community/leave/constants/policyLeaveTypeConstants";
import { LEAVE_REQUESTS_URL } from "~community/leave/types/PendingLeaves";
import {
  PolicyManagerLeaveRequestQueryParams,
  PolicyManagerLeaveRequestType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import {
  stackStyles,
  tableContainerStyles,
  tableHeaderCellStyles,
  tableHeaderRowStyles,
  tableWrapperStyles
} from "./styles";

interface Props {
  searchTerm?: string;
}

interface TableHeader {
  id: string;
  label: string;
}

const PolicyPendingLeaveRequests: React.FC<Props> = ({ searchTerm }) => {
  const translateText = useTranslator("leaveModule", "pendingRequests");
  const theme: Theme = useTheme();
  const router = useRouter();

  const navigateToLeaveRequests = () => {
    router.push(LEAVE_REQUESTS_URL);
  };

  const { setToastMessage } = useToast();

  const tableHeaders: TableHeader[] = [
    { id: "employee", label: translateText(["employeeHeader"]) },
    { id: "leaveDuration", label: translateText(["leaveDurationHeader"]) },
    { id: "leaveType", label: translateText(["leaveTypeHeader"]) },
    { id: "actions", label: "" }
  ];

  const pendingRequestParams = useMemo<PolicyManagerLeaveRequestQueryParams>(
    () => ({
      page: UNPAGINATED_PAGE,
      size: UNPAGINATED_SIZE,
      sortKey: SortKeyTypes.START_DATE,
      sortOrder: SortOrderTypes.ASC,
      status: PolicyLeaveRequestStatus.PENDING,
      searchKeyword: searchTerm || undefined
    }),
    [searchTerm]
  );

  const { data } = useGetPolicyManagerLeaveRequests(pendingRequestParams);

  const { sendEvent } = useGoogleAnalyticsEvent();

  const { mutate: approveLeaveRequest, isPending: isApprovePending } =
    useReviewPolicyLeaveRequest(
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["RequestApproveTitle"]),
          description: translateText(["RequestApproveDescription"]),
          isIcon: true
        });
        sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_QUICK_APPROVED);
      },
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["RequestApproveFailTitle"]),
          description: translateText(["RequestApproveFailDescription"]),
          isIcon: true
        });
      }
    );

  const { mutate: declineLeaveRequest, isPending: isDeclinePending } =
    useReviewPolicyLeaveRequest(
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.SUCCESS,
          title: translateText(["RequestDeclineTitle"]),
          description: translateText(["RequestDeclineDescription"]),
          isIcon: true
        });
        sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_QUICK_DECLINED);
      },
      () => {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["RequestDeclineFailTitle"]),
          description: translateText(["RequestDeclineFailDescription"]),
          isIcon: true
        });
      }
    );

  const isReviewPending = isApprovePending || isDeclinePending;

  const handleLeaveRequestApproval = (leaveRequestId: number): void => {
    approveLeaveRequest({
      leaveRequestId,
      status: PolicyLeaveRequestStatus.APPROVED
    });
  };

  const handleLeaveRequestDecline = (leaveRequestId: number): void => {
    declineLeaveRequest({
      leaveRequestId,
      status: PolicyLeaveRequestStatus.DENIED
    });
  };

  const leaveRequests = data?.items ?? [];

  const tableRows = leaveRequests.map(
    (request: PolicyManagerLeaveRequestType) => ({
      id: request.leaveRequestId,
      employee: (
        <Box width="100%">
          <AvatarChip
            firstName={request.employee.firstName}
            lastName={request.employee.lastName}
            avatarUrl={request.employee.authPic || ""}
            chipStyles={{ maxWidth: "fit-content" }}
          />
        </Box>
      ),
      leaveDuration: (
        <Box sx={{ color: "black" }}>
          {request.startDate} to {request.endDate}
          <BasicChip
            label={`${request.durationDays} ${
              request.durationDays === 1
                ? translateText(["day"])
                : translateText(["days"])
            }`}
            chipStyles={{ ml: 2 }}
          />
        </Box>
      ),
      leaveType: (
        <IconChip
          icon={getEmoji(request.leaveType.emojiCode)}
          label={`${getEmoji(request.leaveType.emojiCode)} ${request.leaveType.name}`}
        />
      ),
      actions: (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ overflowX: "auto", alignItems: "center" }}
        >
          <ButtonV2
            variant={"tertiary"}
            onClick={() => handleLeaveRequestDecline(request.leaveRequestId)}
            disabled={isReviewPending}
            type={"reset"}
            size={"md"}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["declineBtn"])}
          </ButtonV2>
          <ButtonV2
            variant={"secondary"}
            onClick={() => handleLeaveRequestApproval(request.leaveRequestId)}
            disabled={isReviewPending}
            type={"submit"}
            size={"md"}
            icon={<Icon name={IconName.CHECK_ICON} />}
            iconPosition="end"
          >
            {translateText(["approveBtn"])}
          </ButtonV2>
        </Stack>
      )
    })
  );

  return (
    <Box>
      <Table
        tableName={TableNames.PENDING_LEAVE_REQUESTS}
        headers={tableHeaders}
        rows={tableRows}
        tableHead={{
          customStyles: {
            row: tableHeaderRowStyles(theme),
            cell: tableHeaderCellStyles(theme)
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: false
          }
        }}
        customStyles={{
          container: tableContainerStyles(theme),
          wrapper: tableWrapperStyles
        }}
      />
      <Stack direction="row" justifyContent="flex-end" sx={stackStyles(theme)}>
        <ButtonV2
          variant={"tertiary"}
          onClick={navigateToLeaveRequests}
          size={"md"}
          icon={<ArrowRightIcon />}
          iconPosition="end"
        >
          {translateText(["viewRequestBtn"])}
        </ButtonV2>
      </Stack>
    </Box>
  );
};

export default PolicyPendingLeaveRequests;
