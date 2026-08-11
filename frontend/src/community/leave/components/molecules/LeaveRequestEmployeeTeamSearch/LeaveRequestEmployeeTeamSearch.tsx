import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import PeopleAndTeamAutocompleteSearch, {
  OptionType
} from "~community/common/components/molecules/AutocompleteSearch/PeopleAndTeamAutocompleteSearch";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { useGetEmployeesAndTeamsForAnalytics } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

interface EmployeeSuggestion {
  employeeId: number;
  firstName: string;
  lastName: string;
  authPic?: string | null;
}

interface TeamSuggestion {
  teamId: number;
  teamName: string;
}

interface EmployeeAndTeamSuggestions {
  employeeResponseDtoList?: EmployeeSuggestion[];
  teamResponseDtoList?: TeamSuggestion[];
}

/**
 * Employee and team search above the all leave requests table. Shared by the legacy and
 * the policy leave variants of the page so both render the same control.
 */
const LeaveRequestEmployeeTeamSearch: FC = () => {
  const translateText = useTranslator("leaveModule");
  const router = useRouter();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchErrors] = useState<string | undefined>(undefined);

  const { setIsFromPeopleDirectory, setViewEmployeeId, setSelectedEmployeeId } =
    usePeopleStore((state) => state);

  const { data: suggestions, isPending: isSuggestionsPending } =
    useGetEmployeesAndTeamsForAnalytics(searchTerm || " ");

  const handleRowClick = async ({ employeeId }: { employeeId: number }) => {
    if (
      user?.roles?.includes(ManagerTypes.PEOPLE_MANAGER) ||
      user?.roles?.includes(AdminTypes.SUPER_ADMIN)
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

  const options = useMemo(() => {
    const employeeAndTeamSuggestions = suggestions as
      | EmployeeAndTeamSuggestions
      | undefined;

    const individualSuggestions =
      employeeAndTeamSuggestions?.employeeResponseDtoList?.map((employee) => {
        return {
          value: employee.employeeId,
          label: `${employee.firstName} ${employee.lastName}`,
          category: "Individuals",
          firstName: employee.firstName,
          lastName: employee.lastName,
          authPic: employee.authPic ?? undefined
        };
      });

    const teamSuggestions =
      employeeAndTeamSuggestions?.teamResponseDtoList?.map((team) => {
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
      placeholder={translateText(["leaveRequests.search"])}
      isLoading={isSuggestionsPending}
      error={searchErrors}
      isDisabled={false}
      required={false}
      label=""
    />
  );
};

export default LeaveRequestEmployeeTeamSearch;
