import {
  Box,
  Chip,
  Divider,
  Stack,
  type Theme,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { JSX, MouseEvent, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import FilterIcon from "~community/common/assets/Icons/FilterIcon";
import { Button } from "@rootcodelabs/skapp-ui";
import styles from "~community/common/components/molecules/FilterButton/styles";
import Popper from "~community/common/components/molecules/Popper/Popper";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/FilterButtonType";
import { pascalCaseFormatter } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

const FilterButton = ({
  id,
  position,
  handleApplyBtnClick,
  handleResetBtnClick,
  children,
  isResetBtnDisabled,
  selectedFilters,
  accessibility
}: FilterButtonTypes): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator("commonComponents", "filterButton");
  const translateAria = useTranslator(
    "commonAria",
    "components",
    "filterButton"
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);

  const isMiniTabScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const isTabScreen = useMediaQuery(theme.breakpoints.down("xl"));
  const visibleFilterCount = isMiniTabScreen ? 0 : isTabScreen ? 1 : 2;

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

  const combinedFilters = selectedFilters.flatMap((filterGroup) =>
    filterGroup.filter.map((item) => ({
      label: item,
      handleFilterDelete: filterGroup.handleFilterDelete
    }))
  );

  const visibleFilters = combinedFilters.slice(0, visibleFilterCount);
  const overflowFilters = combinedFilters.slice(visibleFilterCount);

  return (
    <Stack sx={classes.wrapper}>
      <Stack
        sx={classes.container}
        role="group"
        aria-label={accessibility?.ariaLabel}
      >
        {visibleFilters.map((filter) => (
          <Chip
            key={filter.label}
            tabIndex={0}
            role="button"
            label={pascalCaseFormatter(filter.label)}
            sx={classes.filterItem}
            onDelete={() => filter.handleFilterDelete(filter.label)}
            onKeyDown={(e) => {
              if (shouldActivateButton(e.key)) {
                filter.handleFilterDelete(filter.label);
              }
            }}
            aria-label={translateAria(["appliedFilter"], {
              filterLabel: pascalCaseFormatter(filter.label)
            })}
            deleteIcon={
              <Box>
                <CloseIcon fill="black" />
              </Box>
            }
          />
        ))}
        {overflowFilters.length > 0 && (
          <Chip label={`+${overflowFilters.length}`} sx={classes.filterItem} />
        )}
        <Button variant={"tertiary"} aria-label={translateAria(["label"])} onClick={(event: MouseEvent<HTMLElement>) =>
            handleFilterBtnClick(event)
          } size={"md"} id="filter-button" icon={<FilterIcon />} iconPosition="end">{translateText(["placeholder"])}</Button>
      </Stack>
      <Popper
        anchorEl={anchorEl}
        open={isPopperOpen}
        position={position}
        id={id}
        handleClose={() => setIsPopperOpen(false)}
        containerStyles={classes.popperContainer}
        ariaLabelledBy="filter-button"
      >
        <Stack sx={classes.popperBody}>{children}</Stack>
        <Divider />
        <Stack sx={classes.popperFooter}>
          <Button type={"reset"} variant={"tertiary"} disabled={isResetBtnDisabled} onClick={onResetBtnClick} size={"md"}>{translateText(["resetBtn"])}</Button>
          <Button type={"button"} variant={"primary"} onClick={onApplyBtnClick} size={"md"}>{translateText(["applyBtn"])}</Button>
        </Stack>
      </Popper>
    </Stack>
  );
};

export default FilterButton;
