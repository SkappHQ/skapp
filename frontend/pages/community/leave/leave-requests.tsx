import { Box, useTheme } from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";

import Search from "~community/common/components/molecules/Search/Search";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import {
  EmployeeSearchResultType,
  TeamSearchResultType
} from "~community/common/types/CommonTypes";
import { useGetManagerAssignedLeaveRequests } from "~community/leave/api/LeaveApi";
import ManagerLeaveRequest from "~community/leave/components/molecules/ManagerLeaveRequests/ManagerLeaveRequest";
import LeaveManagerModalController from "~community/leave/components/organisms/LeaveManagerModalController/LeaveManagerModalController";
import { useLeaveStore } from "~community/leave/store/store";
import { useGetEmployeesAndTeamsForAnalytics } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const LeaveRequests: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leaveRequests");
  const translateAria = useTranslator("leaveAria", "allLeaveRequests");
  const theme = useTheme();
  const router = useRouter();
  const { data } = useSession();
  const { toastMessage, setToastMessage } = useToast();

  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");
  const [searchErrors] = useState<string | undefined>(undefined);

  const { setIsFromPeopleDirectory, setViewEmployeeId, setSelectedEmployeeId } =
    usePeopleStore((state) => state);
  const { data: suggestions } = useGetEmployeesAndTeamsForAnalytics(
    searchTerm || " "
  );

  const { data: assignedLeaveRequests, isLoading } =
    useGetManagerAssignedLeaveRequests();

  const { setLeaveRequestParams } = useLeaveStore((state) => state);

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_ALL_LEAVE_REQUEST_PAGE_VIEWED,
    triggerOnMount: true
  });

  const onSearchChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    e.target.value = e.target.value.replace(/^\s+/g, "");
    setSearchTerm(e.target.value);
  };

  const onSelectResult = async (
    result: EmployeeSearchResultType | TeamSearchResultType
  ): Promise<void> => {
    if ((result as EmployeeSearchResultType)?.employeeId) {
      const employeeId = (result as EmployeeSearchResultType)?.employeeId;
      const employeeName = `${(result as EmployeeSearchResultType)?.firstName} ${
        (result as EmployeeSearchResultType)?.lastName
      }`;

      setSelectedUserName(employeeName);
      setSelectedTeamName("");

      await handleRowClick({
        id: employeeId
      });
    } else {
      const teamId = (result as TeamSearchResultType)?.teamId;
      await router.push(
        `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/${teamId}?teamName=${encodeURIComponent((result as TeamSearchResultType)?.teamName)}`
      );
      setSelectedTeamName((result as TeamSearchResultType)?.teamName);
      setSelectedUserName("");
    }
    setIsPopperOpen(false);
    setSearchTerm("");
  };

  const handleRowClick = async (employee: { id: number }) => {
    if (
      data?.user.roles?.includes(
        ManagerTypes.PEOPLE_MANAGER || AdminTypes.SUPER_ADMIN
      )
    ) {
      setSelectedEmployeeId(employee.id);
      const url = `${ROUTES.PEOPLE.EDIT(employee.id)}?tab=leave`;
      await router.push(url);
    } else {
      setIsFromPeopleDirectory(true);
      setViewEmployeeId(employee.id);
      const url = `${ROUTES.PEOPLE.INDIVIDUAL}/${employee.id}?tab=leave`;
      await router.push(url);
    }
  };

  useEffect(() => {
    setLeaveRequestParams("status", ["PENDING"]);
  }, [setLeaveRequestParams]);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
    >
      <Box role="region" aria-label={translateAria(["allLeaveRequestPage"])}>
        <Search
          placeHolder={
            selectedUserName || selectedTeamName || translateText(["search"])
          }
          label=""
          setIsPopperOpen={setIsPopperOpen}
          isPopperOpen={isPopperOpen}
          labelStyles={{ mb: "0.25rem" }}
          onChange={onSearchChange}
          value={searchTerm}
          error={searchErrors}
          onSelectMember={(result) =>
            onSelectResult(
              result as EmployeeSearchResultType | TeamSearchResultType
            )
          }
          isAutoFocus={true}
          filterSearchResult={true}
          isEmployeeAndUserSearch={true}
          employeeAndUserSearchResult={suggestions}
          suggestionBoxStyles={{
            maxHeight: "15.625rem",
            backgroundColor: theme.palette.notifyBadge.contrastText
          }}
          popperStyles={{
            boxShadow: `0rem 0.25rem 1.25rem ${theme.palette.grey.A200}`,
            width: "100%"
          }}
          ariaLabel={translateAria(["searchAllLeaveRequests"])}
        />

        <ManagerLeaveRequest
          employeeLeaveRequests={assignedLeaveRequests?.items ?? []}
          totalPages={assignedLeaveRequests?.totalPages}
          isLoading={isLoading}
        />

        <LeaveManagerModalController />
        <ToastMessage
          {...toastMessage}
          open={toastMessage.open}
          onClose={() => {
            setToastMessage((state) => ({ ...state, open: false }));
          }}
        />
      </Box>
    </ContentLayout>
  );
};

export default LeaveRequests;
