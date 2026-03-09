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

const JobFamiliesSection = ({
  jobFamilies,
  basicChipRef
}: {
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
  jobFamilies?: FilterButtonTypes[];
}) => {
  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);
  const translateText = useTranslator("peopleModule", "peoples.filters");

  const { employeeDataFilter, setEmployeeDataFilter } = usePeopleStore(
    (state) => state
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [searchErrors, _setSearchErrors] = useState<string | undefined>(
    undefined
  );

  const handleJobFamilySelect = (value: FilterButtonTypes) => {
    if (!employeeDataFilter.role.some((item) => item.id === value.id)) {
      setEmployeeDataFilter("role", [...employeeDataFilter.role, value]);
    } else {
      setEmployeeDataFilter(
        "role",
        employeeDataFilter.role.filter(
          (currentFilter) => currentFilter.id !== value.id
        )
      );
    }
  };

  const onSelectOption = (value: FilterButtonTypes): void => {
    setSearchTerm("");
    if (!employeeDataFilter.role.includes(value)) {
      handleJobFamilySelect(value);
    }
  };

  return (
    <div>
      <div>
        <p className={`mb-2 ${isSmallScreen ? "subtitle4" : "subtitle3"}`}>
          {translateText(["jobFamilies"])}
        </p>

        <div>
          {jobFamilies && jobFamilies.length > 8 ? (
            <div>
              <FilterSearch
                id="search-job-families-input"
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
                suggestions={jobFamilies}
                selectedOptions={
                  employeeDataFilter?.role as FilterSearchSuggestionsType[]
                }
              />
              {employeeDataFilter?.role &&
                employeeDataFilter.role.length > 0 && (
                  <SelectableChipList<string | number>
                    items={employeeDataFilter.role.map((role) => ({
                      label: role.text,
                      value: role.id ?? ""
                    }))}
                    selectedValues={employeeDataFilter.role.map(
                      (role) => role.id ?? ""
                    )}
                    onChipClick={(id) => {
                      const roleToRemove = employeeDataFilter.role.find(
                        (r) => (r.id ?? "") === id
                      );
                      if (roleToRemove) {
                        handleJobFamilySelect(roleToRemove);
                      }
                    }}
                    chipRefs={basicChipRef}
                  />
                )}
            </div>
          ) : (
            <SelectableChipList<string | number>
              items={
                jobFamilies?.map((jobFamily) => ({
                  label: jobFamily.text,
                  value: jobFamily.id ?? ""
                })) ?? []
              }
              selectedValues={employeeDataFilter.role.map(
                (role) => role.id ?? ""
              )}
              onChipClick={(id) => {
                const jobFamily = jobFamilies?.find(
                  (jf) => (jf.id ?? "") === id
                );
                if (jobFamily) {
                  handleJobFamilySelect(jobFamily);
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

export default JobFamiliesSection;
