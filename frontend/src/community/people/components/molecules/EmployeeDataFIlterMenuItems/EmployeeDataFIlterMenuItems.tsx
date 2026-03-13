import {
  AdvancedFilterStructure,
  SelectableList,
  SelectedFiltersDisplay
} from "@rootcodelabs/skapp-ui";
import { JSX, useCallback, useMemo, useRef, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { usePeopleStore } from "~community/people/store/store";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";
import { handleApplyFilterPrams } from "~community/people/utils/handleEmployeeDataFIlters";

import FilterTypeDetailedSection from "./FilterTypeDetailedSection";

interface Props {
  handleClose: () => void;
  scrollToTop: () => void;
  teams?: FilterButtonTypes[] | undefined;
  jobFamilies?: FilterButtonTypes[] | undefined;
}

const EmployeeDataFIlterMenuItems = ({
  handleClose,
  teams,
  jobFamilies
}: Props): JSX.Element => {
  const firstColumnItems = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const secondColumnItems = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );

  const [selected, setSelected] = useState<PeopleFilterHeadings>(
    PeopleFilterHeadings.DEMOGRAPICS
  );

  const translateText = useTranslator("peopleModule", "peoples.filters");

  const { employeeDataFilter, setEmployeeDataParams, resetEmployeeDataParams } =
    usePeopleStore((state) => state);

  const filterOptions = useMemo(
    () => [
      {
        label: translateText(["demographics"]),
        value: PeopleFilterHeadings.DEMOGRAPICS
      },
      {
        label: translateText(["employements"]),
        value: PeopleFilterHeadings.EMPLOYMENTS
      },
      {
        label: translateText(["jobFamilies"]),
        value: PeopleFilterHeadings.JOB_FAMILIES
      },
      {
        label: translateText(["teams"]),
        value: PeopleFilterHeadings.TEAMS
      },
      {
        label: translateText(["userRoles"]),
        value: PeopleFilterHeadings.USER_ROLES
      }
    ],
    [translateText]
  );

  const getSecondColumnFirstKey = (filterValue: PeopleFilterHeadings) => {
    if (filterValue === PeopleFilterHeadings.EMPLOYMENTS) {
      return `${filterValue}employmentTypes0`;
    } else if (filterValue === PeopleFilterHeadings.USER_ROLES) {
      return `${filterValue}attendance0`;
    } else {
      return `${filterValue}0`;
    }
  };

  const handleSubmit = () => {
    handleApplyFilterPrams(setEmployeeDataParams, employeeDataFilter);
    handleClose();
  };

  const handleReset = () => {
    handleClose();
    resetEmployeeDataParams();
    setSelected(PeopleFilterHeadings.DEMOGRAPICS);
  };

  const getJobFamilyNames = useMemo(() => {
    return employeeDataFilter.role.map((jobFamily) => jobFamily.text);
  }, [employeeDataFilter.role]);

  const getTeamNames = useMemo(() => {
    return employeeDataFilter.team.map((team) => team.text);
  }, [employeeDataFilter.team]);

  const translateItems = useCallback(
    (items: string[]) => {
      return items.map((item) => {
        const translated = translateText([
          `selectedFiltersFilterItems.${item.toLowerCase()}`
        ]);
        return translated.includes("peopleModule") ? item : translated;
      });
    },
    [translateText]
  );

  const filterSections = useMemo(
    () => [
      {
        title: translateText(["demographics"]),
        items: translateItems([
          ...(employeeDataFilter.gender ? [employeeDataFilter.gender] : []),
          ...employeeDataFilter.nationality
        ])
      },
      {
        title: translateText(["employements"]),
        items: translateItems([
          ...employeeDataFilter.employmentTypes,
          ...employeeDataFilter.employmentAllocations,
          ...employeeDataFilter.accountStatus
        ])
      },
      {
        title: translateText(["jobFamilies"]),
        items: getJobFamilyNames
      },
      {
        title: translateText(["teams"]),
        items: getTeamNames
      },
      {
        title: translateText(["userRoles"]),
        items: translateItems(employeeDataFilter.permission)
      }
    ],
    [
      employeeDataFilter,
      getJobFamilyNames,
      getTeamNames,
      translateText,
      translateItems
    ]
  );

  return (
    <AdvancedFilterStructure
      title={translateText(["filters"])}
      leftColumn={
        <SelectableList<PeopleFilterHeadings>
          options={filterOptions}
          selected={selected}
          setSelected={setSelected}
          firstColumnItems={firstColumnItems}
          secondColumnItems={secondColumnItems}
          getSecondColumnFirstKey={getSecondColumnFirstKey}
        />
      }
      centerColumn={
        <FilterTypeDetailedSection
          basicChipRef={secondColumnItems}
          selected={selected}
          teams={teams}
          jobFamilies={jobFamilies}
        />
      }
      rightColumn={
        <SelectedFiltersDisplay
          filterSections={filterSections}
          headerText={translateText(["selectedFilters"], {
            count: filterSections.reduce(
              (count, section) => count + section.items.length,
              0
            )
          })}
          noFiltersText={translateText(["noFIlters"])}
        />
      }
      resetButtonProps={{
        onClick: handleReset,
        children: translateText(["reset"])
      }}
      applyButtonProps={{
        onClick: handleSubmit,
        children: translateText(["apply"])
      }}
    />
  );
};

export default EmployeeDataFIlterMenuItems;
