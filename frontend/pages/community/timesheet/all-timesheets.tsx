import { Stack } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ManagerTimesheet from "~community/attendance/components/organisms/ManagerTimesheet/ManagerTImesheet";
import { TimeSheetSearchBarCategories } from "~community/attendance/enums/timesheetEnums";
import { useAuth } from "~community/auth/providers/AuthProvider";
import PeopleAndTeamAutocompleteSearch, {
  OptionType
} from "~community/common/components/molecules/AutocompleteSearch/PeopleAndTeamAutocompleteSearch";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import NotificationReadProvider from "~community/common/providers/NotificationReadProvider";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { NotificationSummaryType } from "~community/common/types/notificationTypes";
import { useGetEmployeesAndTeamsForAnalytics } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

const AllTimesheetsPage: NextPage = () => {
  const translateText = useTranslator("attendanceModule");
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
      const url = `${ROUTES.PEOPLE.EDIT(employeeId)}?tab=timesheet`;
      await router.push(url);
    } else {
      setIsFromPeopleDirectory(true);
      setViewEmployeeId(employeeId);
      const url = `${ROUTES.PEOPLE.INDIVIDUAL}/${employeeId}?tab=timesheet`;
      await router.push(url);
    }
  };

  const options = useMemo(() => {
    const individualSuggestions = suggestions?.employeeResponseDtoList?.map(
      (employee) => {
        return {
          value: employee.employeeId,
          label: `${employee.firstName} ${employee.lastName}`,
          category: TimeSheetSearchBarCategories.INDIVIDUALS,
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
        category: TimeSheetSearchBarCategories.TEAMS,
        teamName: team.teamName
      };
    });

    return [...(individualSuggestions || []), ...(teamSuggestions || [])];
  }, [suggestions]);

  const onSearchChange = async (value: OptionType | null) => {
    if (value?.category === TimeSheetSearchBarCategories.INDIVIDUALS) {
      await handleRowClick({ employeeId: value.value });
    }

    if (value?.category === TimeSheetSearchBarCategories.TEAMS) {
      await router.push(
        `${ROUTES.TIMESHEET.TIMESHEET_ANALYTICS}/${value.value}?teamName=${encodeURIComponent(value.label)}`
      );
    }

    setSearchTerm("");
  };

  return (
    <NotificationReadProvider
      notificationType={NotificationSummaryType.TIME_ENTRY}
    >
      <ContentLayout
        breadcrumbs={[
          {
            label: translateText(["dashboards.stepTimeSheet"])
          },
          {
            label: translateText(["timesheet.allTimesheets.title"])
          }
        ]}
        title={translateText(["timesheet.allTimesheets.title"])}
        isDividerVisible={true}
        pageHead={translateText(["timesheet.allTimesheets.pageHead"])}
      >
        <Stack sx={{ gap: 2 }}>
          <PeopleAndTeamAutocompleteSearch
            id={{
              autocomplete: "all-timesheets-autocomplete",
              textField: "all-timesheets-text-field"
            }}
            name="allTimesheetsSearch"
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
          <ManagerTimesheet />
        </Stack>
      </ContentLayout>
    </NotificationReadProvider>
  );
};

export default AllTimesheetsPage;
