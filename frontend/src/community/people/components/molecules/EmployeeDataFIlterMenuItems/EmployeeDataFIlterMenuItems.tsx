import { Box, Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
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
    <Box>
      <Box
        sx={{
          backgroundColor: "common.white",
          flexDirection: "row",
          display: "flex",
          paddingX: isSmallScreen ? 2 : 3,
          paddingTop: 2,
          maxHeight: 350
        }}
      >
        <Stack
          sx={{
            flex: 1,
            borderRight: 2,
            borderRightColor: "#D4D4D8"
          }}
        >
          <FIlterTypeSection
            firstColumnItems={firstColumnItems}
            secondColumnItems={secondColumnItems}
            selected={selected}
            setSelected={setSelected}
          />
        </Stack>
        <Stack
          sx={{
            flex: 2,
            borderRight: 2,
            borderRightColor: "#D4D4D8"
          }}
        >
          <FilterTypeDetailedSection
            basicChipRef={secondColumnItems}
            selected={selected}
            teams={teams}
            jobFamilies={jobFamilies}
          />
        </Stack>
        {!isSmallScreen && (
          <Stack
            sx={{
              flex: 2
            }}
          >
            <SelectedFiltersSection />
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          paddingX: 3,
          backgroundColor: "common.white"
        }}
      >
        <Box
          sx={{
            borderTop: 2,
            borderTopColor: "#D4D4D8",
            paddingX: 3,
            paddingY: 2,
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 2
          }}
        >
          <ButtonV2
            variant="tertiary"
            size={isSmallScreen ? "sm" : "md"}
            onClick={() => {
              handleClose();
              resetEmployeeDataParams();
              setSelected(PeopleFilterHeadings.DEMOGRAPICS);
            }}
          >
            {translateText(["reset"])}
          </ButtonV2>
          <ButtonV2
            variant="primary"
            size={isSmallScreen ? "sm" : "md"}
            onClick={handleSubmit}
          >
            {translateText(["apply"])}
          </ButtonV2>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeDataFIlterMenuItems;
