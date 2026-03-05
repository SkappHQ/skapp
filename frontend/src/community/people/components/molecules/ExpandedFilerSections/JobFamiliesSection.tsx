import { useTheme } from "@mui/material";
import { RefObject, useState } from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import FilterSearch from "~community/common/components/molecules/FilterSearch/FilterSearch";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  FilterButtonTypes,
  FilterSearchSuggestionsType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { usePeopleStore } from "~community/people/store/store";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";

const JobFamiliesSection = ({
  jobFamilies,
  basicChipRef,
  selected
}: {
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
  selected: PeopleFilterHeadings;
  jobFamilies?: FilterButtonTypes[] | undefined;
}) => {
  const theme = useTheme();
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
              <div className="flex flex-row space-x-1 gap-2 flex-wrap">
                {employeeDataFilter?.role?.map((chip, index) => (
                  <div key={index}>
                    <IconChip
                      ref={(el: HTMLDivElement | null) => {
                        if (el && basicChipRef.current) {
                          basicChipRef.current[selected + index] = el;
                        }
                      }}
                      label={chip.text}
                      icon={
                        <Icon
                          name={IconName.SELECTED_ICON}
                          fill={theme.palette.primary.dark}
                        />
                      }
                      chipStyles={{
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.primary.dark,
                        padding: "8px 12px"
                      }}
                      onClick={() => {
                        setEmployeeDataFilter(
                          "role",
                          employeeDataFilter.role.filter(
                            (currentFilter) => currentFilter !== chip
                          )
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-row space-x-1 gap-2 flex-wrap">
              {jobFamilies?.map((jobFamily, index) => (
                <div key={index}>
                  <IconChip
                    ref={(el: HTMLDivElement | null) => {
                      if (el && basicChipRef.current) {
                        basicChipRef.current[selected + index] = el;
                      }
                    }}
                    label={jobFamily.text}
                    onClick={() => handleJobFamilySelect(jobFamily)}
                    icon={
                      employeeDataFilter.role.some(
                        (item) => item.id === jobFamily.id
                      ) ? (
                        <Icon
                          name={IconName.SELECTED_ICON}
                          fill={theme.palette.primary.dark}
                        />
                      ) : undefined
                    }
                    chipStyles={{
                      backgroundColor: employeeDataFilter.role.some(
                        (item) => item.id === jobFamily.id
                      )
                        ? theme.palette.secondary.main
                        : theme.palette.grey[100],
                      color: employeeDataFilter.role.some(
                        (item) => item.id === jobFamily.id
                      )
                        ? theme.palette.primary.dark
                        : "black",
                      padding: "8px 12px",
                      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                      border: employeeDataFilter.role.some(
                        (item) => item.id === jobFamily.id
                      )
                        ? `1px solid ${theme.palette.secondary.dark}`
                        : "none"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobFamiliesSection;
