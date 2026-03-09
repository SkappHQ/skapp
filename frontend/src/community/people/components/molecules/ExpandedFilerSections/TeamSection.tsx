import { RefObject, useState } from "react";

import FilterSearch from "~community/common/components/molecules/FilterSearch/FilterSearch";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  FilterButtonTypes,
  FilterSearchSuggestionsType
} from "~community/common/types/CommonTypes";
import SelectableChipList from "~community/people/components/MoveToSkappUI/SelectableChipList";
import { usePeopleStore } from "~community/people/store/store";

const TeamSection = ({
  teams,
  basicChipRef
}: {
  teams?: FilterButtonTypes[];
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);
  const translateText = useTranslator("peopleModule", "peoples.filters");

  const [searchTerm, setSearchTerm] = useState("");
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);

  const [searchErrors, _setSearchErrors] = useState<string | undefined>(
    undefined
  );
  const { employeeDataFilter, setEmployeeDataFilter } = usePeopleStore(
    (state) => state
  );

  const handleTeamSelect = (team: FilterButtonTypes) => {
    if (!employeeDataFilter.team.some((item) => item.id === team.id)) {
      setEmployeeDataFilter("team", [...employeeDataFilter.team, team]);
    } else {
      setEmployeeDataFilter(
        "team",
        employeeDataFilter.team.filter(
          (currentFilter) => currentFilter.id !== team.id
        )
      );
    }
  };

  const onSelectOption = (value: FilterButtonTypes): void => {
    setSearchTerm("");
    if (!employeeDataFilter.team.includes(value)) {
      handleTeamSelect(value);
    }
  };

  return (
    <div>
      <div>
        <p className={`mb-2 ${isSmallScreen ? "subtitle4" : "subtitle3"}`}>
          {translateText(["teams"])}
        </p>

        <div>
          {teams && teams?.length > 8 ? (
            <div>
              <FilterSearch
                id="search-team-input"
                setIsPopperOpen={setIsPopperOpen}
                isPopperOpen={isPopperOpen}
                labelStyles={{ mb: "0.25rem" }}
                componentStyles={{ mr: "1.25rem", my: 2 }}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                error={searchErrors}
                onSelectOption={(result) =>
                  onSelectOption(result as FilterButtonTypes)
                }
                popperStyles={{
                  width: "100%"
                }}
                filterSearchResult={true}
                suggestions={teams}
                selectedOptions={
                  employeeDataFilter?.team as FilterSearchSuggestionsType[]
                }
              />
              {employeeDataFilter?.team &&
                employeeDataFilter.team.length > 0 && (
                  <SelectableChipList<string | number>
                    items={employeeDataFilter.team.map((team) => ({
                      label: team.text,
                      value: team.id ?? ""
                    }))}
                    selectedValues={employeeDataFilter.team.map(
                      (team) => team.id ?? ""
                    )}
                    onChipClick={(id) => {
                      const teamToRemove = employeeDataFilter.team.find(
                        (t) => (t.id ?? "") === id
                      );
                      if (teamToRemove) {
                        handleTeamSelect(teamToRemove);
                      }
                    }}
                    chipRefs={basicChipRef}
                  />
                )}
            </div>
          ) : (
            <SelectableChipList<string | number>
              items={
                teams?.map((team) => ({
                  label: team.text,
                  value: team.id ?? ""
                })) ?? []
              }
              selectedValues={employeeDataFilter.team.map(
                (team) => team.id ?? ""
              )}
              onChipClick={(id) => {
                const team = teams?.find((t) => (t.id ?? "") === id);
                if (team) {
                  handleTeamSelect(team);
                }
              }}
              chipRefs={basicChipRef}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;
