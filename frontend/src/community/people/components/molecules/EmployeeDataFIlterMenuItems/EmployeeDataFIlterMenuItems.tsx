import { Button } from "@rootcodelabs/skapp-ui";
import { JSX, useRef, useState } from "react";

import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { usePeopleStore } from "~community/people/store/store";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";
import { handleApplyFilterPrams } from "~community/people/utils/handleEmployeeDataFIlters";

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

  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);
  const translateText = useTranslator("peopleModule", "peoples.filters");

  const { employeeDataFilter, setEmployeeDataParams, resetEmployeeDataParams } =
    usePeopleStore((state) => state);

  const handleSubmit = () => {
    handleApplyFilterPrams(setEmployeeDataParams, employeeDataFilter);
    handleClose();
  };

  return (
    <div className="bg-white">
      <div className="px-5 py-4 border-b border-b-secondary-accent">
        <h1 className="h2">{translateText(["filters"])}</h1>
      </div>
      <div
        className={`flex flex-row max-h-[350px] ${isSmallScreen ? "px-3" : "px-5"}`}
      >
        <div className="flex-1 border-r border-r-secondary-accent py-4">
          <FIlterTypeSection
            firstColumnItems={firstColumnItems}
            secondColumnItems={secondColumnItems}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
        <div className="flex-2 border-r border-r-secondary-accent py-4">
          <FilterTypeDetailedSection
            basicChipRef={secondColumnItems}
            selected={selected}
            teams={teams}
            jobFamilies={jobFamilies}
          />
        </div>
        {!isSmallScreen && (
          <div className="flex-2 py-4">
            <SelectedFiltersSection />
          </div>
        )}
      </div>
      <div className="border-t border-t-secondary-accent px-5 py-4 flex flex-row items-center justify-end gap-4">
        <Button
          variant="tertiary"
          size={isSmallScreen ? "sm" : "md"}
          onClick={() => {
            handleClose();
            resetEmployeeDataParams();
            setSelected(PeopleFilterHeadings.DEMOGRAPICS);
          }}
        >
          {translateText(["reset"])}
        </Button>
        <Button size={isSmallScreen ? "sm" : "md"} onClick={handleSubmit}>
          {translateText(["apply"])}
        </Button>
      </div>
    </div>
  );
};

export default EmployeeDataFIlterMenuItems;
