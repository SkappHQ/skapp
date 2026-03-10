import { Box, Stack } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import React from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import Table from "~community/common/components/molecules/Table/Table";

import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useGetPendingLeaveRequests,
  useUpdateLeaveRequest
} from "~community/leave/api/LeaveApi";
import {
  LEAVE_REQUESTS_URL,
  LeaveRequest,
  PendingLeaveEnum
} from "~community/leave/types/PendingLeaves";
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

const PendingLeaveRequestTable: React.FC<Props> = ({ searchTerm }) => {
  const translateText = useTranslator("leaveModule", "pendingRequests");
  const theme: Theme = useTheme();
  const router = useRouter();

  const navigateToLeaveRequests = () => {
    router.push(LEAVE_REQUESTS_URL);
  };

  const { toastMessage, setToastMessage } = useToast();

  const tableHeaders: TableHeader[] = [
    { id: "employee", label: translateText(["employeeHeader"]) },
    { id: "leaveDuration", label: translateText(["leaveDurationHeader"]) },
    { id: "leaveType", label: translateText(["leaveTypeHeader"]) },
    { id: "actions", label: "" }
  ];

  const { data, refetch } = useGetPendingLeaveRequests(searchTerm || "");

  const updateLeaveRequest = useUpdateLeaveRequest;

  const { sendEvent } = useGoogleAnalyticsEvent();

  const handleLeaveRequestApproval = async (leaveRequestId: number) => {
    try {
      await updateLeaveRequest({
        leaveRequestId,
        status: PendingLeaveEnum.APPROVED
      });
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["RequestApproveTitle"]),
        description: translateText(["RequestApproveDescription"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_QUICK_APPROVED);
      await refetch();
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["RequestApproveFailTitle"]),
        description: translateText(["RequestApproveFailDescription"]),
        isIcon: true
      });
    }
  };

  const handleLeaveRequestDecline = async (leaveRequestId: number) => {
    try {
      await updateLeaveRequest({
        leaveRequestId,
        status: PendingLeaveEnum.DENIED
      });
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["RequestDeclineTitle"]),
        description: translateText(["RequestDeclineDescription"]),
        isIcon: true
      });
      sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_QUICK_DECLINED);
      await refetch();
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["RequestDeclineFailTitle"]),
        description: translateText(["RequestDeclineFailDescription"]),
        isIcon: true
      });
    }
  };

  const leaveRequests = data || [];

  const tableRows = leaveRequests.map((request: LeaveRequest) => ({
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
        <Button variant={"tertiary"} onClick={() => handleLeaveRequestDecline(request.leaveRequestId)} type={"reset"} size={"md"} icon={<Icon name={IconName.CLOSE_ICON} />} iconPosition="end">{translateText(["declineBtn"])}</Button>
        <Button variant={"secondary"} onClick={() => handleLeaveRequestApproval(request.leaveRequestId)} type={"submit"} size={"md"} icon={<Icon name={IconName.CHECK_ICON} />} iconPosition="end">{translateText(["approveBtn"])}</Button>
      </Stack>
    )
  }));

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
        <Button variant={"tertiary"} onClick={navigateToLeaveRequests} size={"md"} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["viewRequestBtn"])}</Button>
      </Stack>
    </Box>
  );
};

export default PendingLeaveRequestTable;
