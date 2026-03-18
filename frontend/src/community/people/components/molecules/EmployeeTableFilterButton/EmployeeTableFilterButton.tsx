import { Box, Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
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
      <Stack direction="row" spacing={"0.25rem"} alignItems="center">
        <ShowSelectedFilters
          filterOptions={flatListValues(appliedEmployeeDataFilter)}
          onDeleteIcon={removeFilters}
        />
        <ButtonV2
          variant={"tertiary"}
          size={"md"}
          onClick={handleFilterClick}
          disabled={disabled}
          aria-describedby={filterId}
          data-testid={peopleDirectoryTestId.buttons.filterBtn}
          icon={<Icon name={IconName.FILTER_ICON} />}
          iconPosition="end"
        >
          {flatListValues(appliedEmployeeDataFilter).length === 0
            ? translateText(["filter"])
            : ""}
        </ButtonV2>
      </Stack>
    </Stack>
  );
};

export default EmployeeTableFilterButton;
