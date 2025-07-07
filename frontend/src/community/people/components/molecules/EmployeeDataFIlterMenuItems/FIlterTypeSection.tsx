import { Stack, Typography, useTheme } from "@mui/material";
import {
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
  useMemo
} from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";

const FilterTypeSection = ({
  firstColumnItems,
  secondColumnItems,
  selected,
  setSelected
}: {
  firstColumnItems: RefObject<{ [key: string]: HTMLDivElement | null }>;
  secondColumnItems: RefObject<{ [key: string]: HTMLDivElement | null }>;
  selected: PeopleFilterHeadings;
  setSelected: Dispatch<SetStateAction<PeopleFilterHeadings>>;
}) => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples.filters");

  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);

  const filters = useMemo(
    () => [
      {
        label: translateText(["demographics"]),
        value: PeopleFilterHeadings.DEMOGRAPICS
      },
      {
        label: translateText(["employements"]),
        value: PeopleFilterHeadings.EMPLOYMENTS
      },
      {
        label: translateText(["jobFamilies"]),
        value: PeopleFilterHeadings.JOB_FAMILIES
      },
      {
        label: translateText(["teams"]),
        value: PeopleFilterHeadings.TEAMS
      },
      {
        label: translateText(["userRoles"]),
        value: PeopleFilterHeadings.USER_ROLES
      }
    ],
    [translateText]
  );

  const handleKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    filterValue: PeopleFilterHeadings
  ) => {
    if (shouldActivateButton(e.key)) {
      setSelected(filterValue);

      requestAnimationFrame(() => {
        const getFirstChildKey = (filterValue: PeopleFilterHeadings) => {
          if (filterValue === PeopleFilterHeadings.EMPLOYMENTS) {
            return `${filterValue}employmentTypes0`;
          } else if (filterValue === PeopleFilterHeadings.USER_ROLES) {
            return `${filterValue}attendance0`;
          } else {
            return `${filterValue}0`;
          }
        };

        const firstChildKey = getFirstChildKey(filterValue);

        if (secondColumnItems?.current?.[firstChildKey]) {
          secondColumnItems.current[firstChildKey]?.focus();
        }
      });
    }
  };

  return (
    <Stack sx={{ paddingRight: isSmallScreen ? 1 : 3 }}>
      <Typography
        variant={isSmallScreen ? "caption" : "body2"}
        sx={{
          fontWeight: "600",
          marginBottom: 2
        }}
      >
        {translateText(["filters"])}
      </Typography>

      <Stack flexDirection="column" gap={1}>
        {filters.map((filter, index) => (
          <BasicChip
            ref={(el: HTMLDivElement | null) => {
              if (firstColumnItems.current) {
                firstColumnItems.current[index] = el;
              }
            }}
            withTooltip={false}
            key={filter.value}
            label={filter.label}
            onClick={() => setSelected(filter.value)}
            onKeyDown={(event) => handleKeyDown(event, filter.value)}
            chipStyles={{
              ".MuiChip-root": {
                textAlign: "left",
                justifyContent: "flex-start"
              },
              display: "flex",
              textAlign: "left",
              justifyContent: "flex-start",
              backgroundColor:
                selected === filter.value
                  ? theme.palette.secondary.main
                  : "common.white",
              color:
                selected === filter.value
                  ? theme.palette.primary.dark
                  : "black",
              padding: "0.75rem 1rem",
              borderRadius: 3,
              fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
              "&:focus": {
                outline: `0.0625rem solid ${theme.palette.common.black}`,
                outlineOffset: "0.125rem"
              }
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default FilterTypeSection;
