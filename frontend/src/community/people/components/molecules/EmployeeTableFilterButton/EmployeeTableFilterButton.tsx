import { Box, Stack, Typography } from "@mui/material";
import { FC, MouseEvent } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { flatListValues } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";

import ShowSelectedFilters from "../ShowSelectedFilters/ShowSelectedFilters";

interface Props {
  handleFilterClick?: (event: MouseEvent<HTMLElement>) => void;
  filterId: string | undefined;
  disabled: boolean;
}

const EmployeeTableFilterButton: FC<Props> = ({
  handleFilterClick,
  filterId,
  disabled
}) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { appliedEmployeeDataFilter, removeEmployeeFilter } = usePeopleStore(
    (state) => state
  );

  const removeFilters = (label?: string) => {
    removeEmployeeFilter(label);
  };

  if (disabled) return null;

  return (
    <Stack direction="row">
      <Box
        sx={{
          alignItems: "center",
          padding: "0.5rem 1rem",
          height: "2.3125rem"
        }}
      >
        {flatListValues(appliedEmployeeDataFilter).length !== 0 && (
          <Typography variant={"body1"}>{translateText(["filter"])}</Typography>
        )}
      </Box>
      <Stack direction="row" spacing={"0.25rem"}>
        <ShowSelectedFilters
          filterOptions={flatListValues(appliedEmployeeDataFilter)}
          onDeleteIcon={removeFilters}
        />
        <Button
          label={
            flatListValues(appliedEmployeeDataFilter).length === 0
              ? translateText(["filter"])
              : ""
          }
          buttonStyle={ButtonStyle.TERTIARY_OUTLINED}
          size={ButtonSizes.MEDIUM}
          endIcon={IconName.FILTER_ICON}
          onClick={handleFilterClick}
          disabled={disabled}
          aria-describedby={filterId}
          data-testid={peopleDirectoryTestId.buttons.filterBtn}
        />
      </Stack>
    </Stack>
  );
};

export default EmployeeTableFilterButton;
