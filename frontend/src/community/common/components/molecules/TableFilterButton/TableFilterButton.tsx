import { Box, Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { flatListValues } from "~community/common/utils/commonUtil";
import ShowSelectedFilters from "~community/people/components/molecules/ShowSelectedFilters/ShowSelectedFilters";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  handleFilterClick?: (event: MouseEvent<HTMLElement>) => void;
  filterId: string | undefined;
  disabled: boolean;
}

const TableFilterButton: FC<Props> = ({
  handleFilterClick,
  filterId,
  disabled
}) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { employeeDataFilter, removeEmployeeFilter } = usePeopleStore(
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
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: "1.3125rem"
          }}
        >
          {translateText(["filter"])}
        </Typography>
      </Box>
      <Stack direction="row" spacing={"0.25rem"}>
        <ShowSelectedFilters
          filterOptions={flatListValues(employeeDataFilter)}
          onDeleteIcon={removeFilters}
        />
        <ButtonV2
          variant={"tertiary"}
          onClick={handleFilterClick}
          disabled={disabled}
          aria-describedby={filterId}
          icon={<Icon name={IconName.FILTER_ICON} />}
          iconPosition="end"
        >
          {flatListValues(employeeDataFilter).length === 0
            ? translateText(["filter"])
            : ""}
        </ButtonV2>
      </Stack>
    </Stack>
  );
};

export default TableFilterButton;
