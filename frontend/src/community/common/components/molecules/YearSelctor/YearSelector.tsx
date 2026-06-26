import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, MouseEvent, useState } from "react";

import DropDownArrow from "~community/common/assets/Icons/DropdownArrow";
import SortRow from "~community/common/components/atoms/SASortRow/SASortRow";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { MenuTypes } from "~community/common/types/MoleculeTypes";

interface Props {
  setYear: (year: number) => void;
}

const YearSelector = ({ setYear }: Props): JSX.Element => {
  const theme: Theme = useTheme();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const closeMenu = (): void => {
    setAnchorEl(null);
    setShowOverlay(false);
  };

  const onSelectYear = (year: number): void => {
    setSelectedYear(year);
    setYear(year);
    closeMenu();
  };

  return (
    <>
      <Box>
        <ButtonV2
          variant={"tertiary"}
          onClick={(event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
            setShowOverlay(true);
          }}
          icon={<DropDownArrow />}
          iconPosition="end"
        >
          {selectedYear.toString()}
        </ButtonV2>
      </Box>
      <Popper
        anchorEl={anchorEl}
        open={Boolean(showOverlay)}
        position={"bottom-end"}
        handleClose={() => closeMenu()}
        menuType={MenuTypes.SORT}
        isManager={true}
        disablePortal={true}
        id="year-popper"
        isFlip={true}
        timeout={300}
        containerStyles={{
          boxShadow: `0rem .55rem 1.25rem ${theme.palette.grey[300]}`,
          zIndex: ZIndexEnums.DEFAULT
        }}
      >
        <Box
          sx={{
            backgroundColor: "common.white"
          }}
        >
          {yearOptions.map((year) => (
            <SortRow
              key={year}
              text={year.toString()}
              selected={selectedYear === year}
              onClick={() => {
                onSelectYear(year);
              }}
            />
          ))}
        </Box>
      </Popper>
    </>
  );
};

export default YearSelector;
