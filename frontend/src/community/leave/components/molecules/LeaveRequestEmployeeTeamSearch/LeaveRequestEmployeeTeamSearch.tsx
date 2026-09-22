import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import PeopleAndTeamAutocompleteSearch, {
  OptionType,
  SearchOptionCategory
} from "~community/common/components/molecules/AutocompleteSearch/PeopleAndTeamAutocompleteSearch";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { matchesLeadingWhitespace } from "~community/common/regex/regexPatterns";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { EmployeeTeamSearchResultType } from "~community/common/types/CommonTypes";
import { useGetEmployeesAndTeamsForAnalytics } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

interface RowClickProps {
  employeeId: number;
}

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

  const handleRowClick = async ({ employeeId }: RowClickProps) => {
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

  const employeeAndTeamOptions = useMemo(() => {
    const employeeAndTeamSuggestions: EmployeeTeamSearchResultType | undefined =
      suggestions;

    const individualOptions =
      employeeAndTeamSuggestions?.employeeResponseDtoList?.map((employee) => ({
        value: employee.employeeId,
        label: `${employee.firstName} ${employee.lastName}`,
        category: SearchOptionCategory.INDIVIDUALS,
        firstName: employee.firstName,
        lastName: employee.lastName,
        authPic: employee.authPic ?? undefined
      }));

    const teamOptions = employeeAndTeamSuggestions?.teamResponseDtoList?.map(
      (team) => ({
        value: team.teamId,
        label: team.teamName,
        category: SearchOptionCategory.TEAMS,
        teamName: team.teamName
      })
    );

    return [...(individualOptions || []), ...(teamOptions || [])];
  }, [suggestions]);

  const onSearchChange = async (value: OptionType | null) => {
    if (value?.category === SearchOptionCategory.INDIVIDUALS) {
      await handleRowClick({ employeeId: value.value });
    }

    if (value?.category === SearchOptionCategory.TEAMS) {
      await router.push(
        `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/${value.value}?teamName=${encodeURIComponent(value.label)}`
      );
    }
  };

  const handleInputChange = (value: string): void => {
    setSearchTerm(value.replace(matchesLeadingWhitespace(), ""));
  };

  return (
    <PeopleAndTeamAutocompleteSearch
      id={{
        autocomplete: "all-leave-requests-autocomplete",
        textField: "all-leave-requests-text-field"
      }}
      name="leaveRequestsSearch"
      options={employeeAndTeamOptions}
      value={null}
      inputValue={searchTerm}
      onChange={onSearchChange}
      onInputChange={handleInputChange}
      placeholder={translateText(["leaveRequests.search"])}
      isLoading={isSuggestionsPending}
      error={searchErrors}
      isDisabled={false}
      required={false}
    />
  );
};

export default LeaveRequestEmployeeTeamSearch;
