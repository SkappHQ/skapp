import { JSX, useRef, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { usePeopleStore } from "~community/people/store/store";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";
import { handleApplyFilterPrams } from "~community/people/utils/handleEmployeeDataFIlters";

import AdvancedFilterStructure from "../AdvancedFilterStructure/AdvancedFilterStructure";
import FIlterTypeSection from "./FIlterTypeSection";
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
        <FIlterTypeSection
          firstColumnItems={firstColumnItems}
          secondColumnItems={secondColumnItems}
          selected={selected}
          setSelected={setSelected}
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
