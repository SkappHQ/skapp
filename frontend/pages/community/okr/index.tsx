import { Box, SelectChangeEvent, Stack } from "@mui/material";
import { NextPage } from "next";
import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState
} from "react";
import { useTranslation } from "react-i18next";

import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import TableEmptyScreen from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { DropdownListType } from "~community/common/types/CommonTypes";
import ObjectiveListItem from "~community/okr/components/ObjectiveListItem/ObjectiveListItem";
import { useTeamObjectives } from "~community/okr/hooks/useTeamObjectives";
import { useGetAllTeams } from "~community/people/api/TeamApi";

const TeamObjectives: NextPage = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<DropdownListType | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<DropdownListType | null>(
    null
  );

  const { data: teamsData } = useGetAllTeams();
  const {
    data: teamObjectivesData,
    isLoading: _isLoading,
    isError: _isError,
    error: _error
  } = useTeamObjectives(
    Number(selectedTeam?.value),
    Number(selectedYear?.label)
  );

  const itemsPerPage = 5;

  const teamOptions: DropdownListType[] = useMemo(() => {
    if (!teamsData || teamsData?.length === 0) {
      return [];
    }
    return teamsData.map((team) => ({
      label: team.teamName,
      value: team.teamId
    }));
  }, [teamsData]);

  const yearOptions: DropdownListType[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: DropdownListType[] = [];

    // Add current year and last 5 years (6 years total)
    for (let i = 0; i < 6; i++) {
      const year = currentYear - i;
      years.push({
        label: year.toString(),
        value: i + 1 // Keep the same value structure as before
      });
    }

    return years;
  }, []);

  // Set current year as default when yearOptions are available
  useEffect(() => {
    if (yearOptions?.length > 0 && !selectedYear) {
      setSelectedYear(yearOptions[0]); // First option is the current year
    }
  }, [yearOptions, selectedYear]);

  // Set first team as default when teamOptions are available
  useEffect(() => {
    if (teamOptions.length > 0 && !selectedTeam) {
      setSelectedTeam(teamOptions[0]); // First option is the first team
    }
  }, [teamOptions, selectedTeam]);

  const handleAddObjective = () => {
    // TODO: Implement add objective functionality
  };

  const handleObjectiveClick = (_objectiveId: number) => {
    // TODO: Implement objective click functionality
  };

  const handleTeamChange = (
    event:
      | SelectChangeEvent
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const selectedValue = (event.target as HTMLInputElement)?.value;

    const selectedOption = teamOptions?.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      setSelectedTeam(selectedOption);
    } else {
      setCurrentPage(0); // Reset to first page when filter changes
    }
  };

  const handleYearChange = (
    event:
      | SelectChangeEvent
      | KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const selectedValue = (event.target as HTMLInputElement)?.value;

    const selectedOption = yearOptions?.find(
      (option) => option.value === selectedValue
    );
    if (selectedOption) {
      setSelectedYear(selectedOption);
    }
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page when search changes
  };

  const handlePaginationChange = (
    _event: ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value - 1);
  };

  // Filter objectives based on search term
  const filteredObjectives = useMemo(() => {
    return teamObjectivesData?.results?.filter(
      (objective) =>
        objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        objective.duration.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, teamObjectivesData]);

  // Calculate pagination
  const getTotalPages = () => {
    if (!filteredObjectives) {
      return 0;
    }
    return Math.ceil(filteredObjectives?.length / itemsPerPage);
  };
  const paginatedObjectives = useMemo(() => {
    if (!filteredObjectives) {
      return [];
    }
    const startIndex = currentPage * itemsPerPage;
    return filteredObjectives.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredObjectives, currentPage, itemsPerPage]);

  return (
    <ContentLayout
      pageHead={t("okrModule.teamObjectives.pageHead")}
      title={t("okrModule.teamObjectives.title")}
      primaryButtonText={t("okrModule.teamObjectives.addObjective")}
      onPrimaryButtonClick={handleAddObjective}
      isDividerVisible={true}
    >
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "stretch", sm: "flex-start" },
            justifyContent: "space-between",
            width: "100%",
            gap: { xs: "1rem", sm: "0" }
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              alignItems: { xs: "stretch", sm: "flex-start" },
              gap: { xs: "1rem", sm: "0" },
              width: { xs: "100%", sm: "auto" }
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "200px" },
                paddingRight: { xs: "0", sm: "1rem" }
              }}
            >
              <DropdownList
                inputName="team-selector"
                placeholder={t("okrModule.teamObjectives.chooseATeam")}
                value={selectedTeam?.value || ""}
                onChange={handleTeamChange}
                itemList={teamOptions}
                componentStyle={{ marginTop: 0 }}
                paperStyles={{
                  borderRadius: "1.5rem"
                }}
              />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "150px" } }}>
              <DropdownList
                inputName="year-selector"
                value={selectedYear?.value || ""}
                onChange={handleYearChange}
                itemList={yearOptions}
                componentStyle={{ marginTop: 0 }}
                paperStyles={{
                  borderRadius: "1.5rem"
                }}
              />
            </Box>
          </Stack>

          <Box sx={{ width: { xs: "100%", sm: "400px" } }}>
            <SearchBox
              placeHolder={t("okrModule.teamObjectives.searchObjectives")}
              setSearchTerm={handleSearchChange}
              value={searchTerm}
              name="objectives-search"
              searchBoxStyles={{
                borderRadius: "1.5rem",
                height: "3rem",
                marginTop: { xs: "0", sm: "0.3rem" }
              }}
              isSearchIconVisible={true}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            width: "100%",
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: "0.5rem",
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: { xs: "100%", sm: "200px" },
                paddingRight: "1rem",
                color: "#666"
              }}
            >
              {t("okrModule.teamObjectives.period")}
            </Box>
            <Box
              sx={{
                width: { xs: "100%", sm: "150px" },
                color: "#666"
              }}
            >
              {t("okrModule.teamObjectives.titleHeader")}
            </Box>
          </Stack>
        </Box>

        {/* Objectives List */}
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          {paginatedObjectives && paginatedObjectives.length > 0 ? (
            paginatedObjectives.map((objective) => (
              <ObjectiveListItem
                key={objective.teamObjectiveId}
                period={objective.effectiveTimePeriod}
                title={objective.title}
                onClick={() => handleObjectiveClick(objective.teamObjectiveId)}
              />
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "20rem",
                width: "100%"
              }}
            >
              <TableEmptyScreen
                title={
                  searchTerm
                    ? t("okrModule.teamObjectives.emptySearchResult.title")
                    : t("okrModule.teamObjectives.emptyState.title")
                }
                description={
                  searchTerm
                    ? t(
                        "okrModule.teamObjectives.emptySearchResult.description"
                      )
                    : t("okrModule.teamObjectives.emptyState.description")
                }
                button={
                  !searchTerm
                    ? {
                        label: t("okrModule.teamObjectives.addObjective"),
                        onClick: handleAddObjective
                      }
                    : undefined
                }
              />
            </Box>
          )}
        </Stack>

        {/* Pagination */}
        {(filteredObjectives?.length ?? 0) > itemsPerPage && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: { xs: "1.5rem", sm: "2rem" },
              paddingX: { xs: "0.5rem", sm: "0" }
            }}
          >
            <Pagination
              totalPages={getTotalPages()}
              currentPage={currentPage}
              onChange={handlePaginationChange}
              tableName="objectives"
              isNumbersVisible={true}
              paginationStyles={{
                "& .MuiPaginationItem-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  minWidth: { xs: "2rem", sm: "2.5rem" },
                  height: { xs: "2rem", sm: "2.5rem" }
                }
              }}
            />
          </Box>
        )}
      </Stack>
    </ContentLayout>
  );
};

export default TeamObjectives;
