import { Stack, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, MouseEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { flatListValues } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";

import ShowSelectedFilters from "../ShowSelectedFilters/ShowSelectedFilters";

interface Props {
  handleFilterClick?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
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
  const theme = useTheme();

  const removeFilters = (label?: string) => {
    removeEmployeeFilter(label);
  };

  if (disabled) return null;

  return (
    <Stack direction="row">
      <Stack direction="row" spacing={"0.25rem"} alignItems="center">
        <ShowSelectedFilters
          filterOptions={flatListValues(appliedEmployeeDataFilter)}
          onDeleteIcon={removeFilters}
        />
        {flatListValues(appliedEmployeeDataFilter).length === 0 ? (
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
            {translateText(["filter"])}
          </ButtonV2>
        ) : (
          <IconButton
            onClick={handleFilterClick}
            disabled={disabled}
            aria-describedby={filterId}
            data-testid={peopleDirectoryTestId.buttons.filterBtn}
            icon={<Icon name={IconName.FILTER_ICON} />}
            ariaLabel={translateText(["filter"])}
            title={translateText(["filter"])}
            buttonStyles={{
              width: "3.25rem",
              height: "3rem",
              backgroundColor: theme.palette.grey[100],
              border: `0.0625rem solid ${theme.palette.grey[500]}`
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default EmployeeTableFilterButton;
