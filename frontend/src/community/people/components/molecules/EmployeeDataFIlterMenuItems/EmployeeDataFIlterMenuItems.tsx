import { JSX, useMemo, useRef, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { usePeopleStore } from "~community/people/store/store";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";
import { handleApplyFilterPrams } from "~community/people/utils/handleEmployeeDataFIlters";

import AdvancedFilterStructure from "../../MoveToSkappUI/AdvancedFilterStructure";
import SelectableList from "../../MoveToSkappUI/SelectableList";
import FilterTypeDetailedSection from "./FilterTypeDetailedSection";
import SelectedFiltersSection from "./SelectedFiltersSection";

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
      rightColumn={<SelectedFiltersSection />}
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
