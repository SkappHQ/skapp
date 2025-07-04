import { Box } from "@mui/material";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import PeopleAndTeamAutocompleteSearch, {
  OptionType
} from "~community/common/components/molecules/AutocompleteSearch/PeopleAndTeamAutocompleteSearch";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
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
  const router = useRouter();
  const { data } = useSession();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchErrors] = useState<string | undefined>(undefined);

  const { setIsFromPeopleDirectory, setViewEmployeeId, setSelectedEmployeeId } =
    usePeopleStore((state) => state);

  const { data: suggestions, isPending: isSuggestionsPending } =
    useGetEmployeesAndTeamsForAnalytics(searchTerm || " ");

  const { data: assignedLeaveRequests, isLoading } =
    useGetManagerAssignedLeaveRequests();

  const { setLeaveRequestParams } = useLeaveStore((state) => state);

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_ALL_LEAVE_REQUEST_PAGE_VIEWED,
    triggerOnMount: true
  });

  const handleRowClick = async ({ employeeId }: { employeeId: number }) => {
    if (
      data?.user.roles?.includes(ManagerTypes.PEOPLE_MANAGER) ||
      data?.user.roles?.includes(AdminTypes.SUPER_ADMIN)
    ) {
      setSelectedEmployeeId(employeeId);
      const url = `${ROUTES.PEOPLE.EDIT(employeeId)}?tab=leave`;
      await router.push(url);
    } else {
      setIsFromPeopleDirectory(true);
      setViewEmployeeId(employeeId);
      const url = `${ROUTES.PEOPLE.INDIVIDUAL}/${employeeId}?tab=leave`;
      await router.push(url);
    }
  };

  useEffect(() => {
    setLeaveRequestParams("status", ["PENDING"]);
  }, [setLeaveRequestParams]);

  const options = useMemo(() => {
    const individualSuggestions = suggestions?.employeeResponseDtoList?.map(
      (employee) => {
        return {
          value: employee.employeeId,
          label: `${employee.firstName} ${employee.lastName}`,
          category: "Individuals",
          firstName: employee.firstName,
          lastName: employee.lastName,
          authPic: employee.authPic
        };
      }
    );

    const teamSuggestions = suggestions?.teamResponseDtoList?.map((team) => {
      return {
        value: team.teamId,
        label: team.teamName,
        category: "Teams",
        teamName: team.teamName
      };
    });

    return [...(individualSuggestions || []), ...(teamSuggestions || [])];
  }, [suggestions]);

  const onSearchChange = async (value: OptionType | null) => {
    if (value?.category === "Individuals") {
      await handleRowClick({ employeeId: value.value });
    }

    if (value?.category === "Teams") {
      await router.push(
        `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/${value.value}?teamName=${encodeURIComponent(value.label)}`
      );
    }
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
    >
      <Box
        role="region"
        aria-label={translateAria(["allLeaveRequestPage"])}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%"
        }}
      >
        <PeopleAndTeamAutocompleteSearch
          id={{
            autocomplete: "all-leave-requests-autocomplete",
            textField: "all-leave-requests-text-field"
          }}
          name="leaveRequestsSearch"
          options={options}
          value={null}
          inputValue={searchTerm}
          onChange={onSearchChange}
          onInputChange={(value) => {
            const formattedValue = value.replace(/^\s+/g, "");
            setSearchTerm(formattedValue);
          }}
          placeholder={translateText(["search"])}
          isLoading={isSuggestionsPending}
          error={searchErrors}
          isDisabled={false}
          required={false}
          label=""
        />

        <ManagerLeaveRequest
          employeeLeaveRequests={assignedLeaveRequests?.items ?? []}
          totalPages={assignedLeaveRequests?.totalPages}
          isLoading={isLoading}
        />

        <LeaveManagerModalController />
      </Box>
    </ContentLayout>
  );
};

export default LeaveRequests;
