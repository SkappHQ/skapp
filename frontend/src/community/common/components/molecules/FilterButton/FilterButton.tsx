import { BasicFilterStructure, Popper } from "@rootcodelabs/skapp-ui";
import { JSX, MouseEvent, useState } from "react";

import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/FilterButtonType";

const FilterButton = ({
  id,
  position,
  handleApplyBtnClick,
  handleResetBtnClick,
  children,
  isResetBtnDisabled,
  selectedFilters
}: FilterButtonTypes): JSX.Element => {
  const translateText = useTranslator("commonComponents", "filterButton");
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "filterButton"
  );

  const filterCount = selectedFilters.reduce(
    (total, group) => total + group.filter.length,
    0
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);

  const handleFilterBtnClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setIsPopperOpen((prevState) => !prevState);
  };

  const onApplyBtnClick = () => {
    handleApplyBtnClick();
    setIsPopperOpen(false);
  };

  const onResetBtnClick = () => {
    handleResetBtnClick();
    setIsPopperOpen(false);
  };

  return (
    <div className="flex flex-row items-center">
      <FilterIconButton
        filterCount={filterCount}
        onClick={(event: MouseEvent<HTMLElement>) =>
          handleFilterBtnClick(event)
        }
        aria-label={translateAria(["label"])}
      />
      <Popper
        anchorEl={anchorEl}
        open={isPopperOpen}
        position={position}
        id={id}
        handleClose={() => setIsPopperOpen(false)}
        containerClassName="rounded-4 shadow-lg"
        ariaLabelledBy="filter-button"
      >
        <BasicFilterStructure
          title={translateText(["title"])}
          resetButtonProps={{
            children: translateText(["resetBtn"]),
            onClick: onResetBtnClick,
            disabled: isResetBtnDisabled
          }}
          applyButtonProps={{
            children: translateText(["applyBtn"]),
            onClick: onApplyBtnClick
          }}
        >
          {children}
        </BasicFilterStructure>
      </Popper>
    </div>
  );
};

export default FilterButton;
