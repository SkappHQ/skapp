import {
  BasicFilterStructure,
  FilterIcon,
  IconButton,
  Popper
} from "@rootcodelabs/skapp-ui";
import { JSX, MouseEvent, useState } from "react";

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

  const getFilterCount = () =>
    selectedFilters.reduce((total, group) => total + group.filter.length, 0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [appliedFilterCount, setAppliedFilterCount] =
    useState<number>(getFilterCount());

  const handleFilterBtnClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setIsPopperOpen((prevState) => !prevState);
  };

  const onApplyBtnClick = () => {
    setAppliedFilterCount(getFilterCount());
    handleApplyBtnClick();
    setIsPopperOpen(false);
  };

  const onResetBtnClick = () => {
    setAppliedFilterCount(0);
    handleResetBtnClick();
    setIsPopperOpen(false);
  };

  const hasFilters = appliedFilterCount > 0;

  return (
    <div className="flex flex-row items-center">
      <IconButton
        icon={
          <FilterIcon
            fill={hasFilters ? "var(--color-primary-accent)" : undefined}
          />
        }
        onClick={(event: MouseEvent<HTMLElement>) =>
          handleFilterBtnClick(event)
        }
        variant={hasFilters ? "outlined" : "default"}
        isRounded={true}
        badge={
          hasFilters ? { count: appliedFilterCount, show: true } : undefined
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
