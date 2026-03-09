import { Box, Chip, Stack, useTheme } from "@mui/material";
import {
  Dispatch,
  JSX,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  ClockInSummaryFilterTypes,
  ClockInSummaryTypes
} from "~community/attendance/enums/dashboardEnums";
import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import FilterIcon from "~community/common/assets/Icons/FilterIcon";
import Button from "~community/common/components/atoms/Button/Button";
import styles from "~community/common/components/molecules/FilterButton/styles";
import Popper from "~community/common/components/molecules/Popper/Popper";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { PopperAndTooltipPositionTypes } from "~community/common/types/MoleculeTypes";
import AdvancedFilterStructure from "~community/people/components/MoveToSkappUI/AdvancedFilterStructure";
import SelectableChipList from "~community/people/components/MoveToSkappUI/SelectableChipList";
import FilterTypeList from "~community/people/components/MoveToSkappUI/SelectableList";
import SelectedFiltersDisplay from "~community/people/components/MoveToSkappUI/SelectedFiltersDisplay";

import BasicChip from "../../atoms/Chips/BasicChip/BasicChip";

interface FilterPanelProps {
  filterTypes: {
    [key: string]:
      | {
          label: string;
          value: string | number | ClockInSummaryTypes;
        }[]
      | undefined;
  };
  onApplyFilters: (selectedFilters: {
    [key: string]: (string | number)[];
  }) => void;
  onResetFilters: () => void;
  id?: string;
  position?: PopperAndTooltipPositionTypes;
  selectedFilters: { [key: string]: (string | number)[] };
  setSelectedFilters: Dispatch<
    SetStateAction<{ [key: string]: (string | number)[] }>
  >;
}

const FilterButton = ({
  id,
  position,
  filterTypes,
  onApplyFilters,
  onResetFilters,
  selectedFilters,
  setSelectedFilters
}: FilterPanelProps): JSX.Element => {
  const theme = useTheme();
  const classes = styles(theme);

  const firstColumnItems = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const secondColumnItems = useRef<{ [key: string]: HTMLElement | null }>({});

  const translateText = useTranslator("commonComponents", "advanceFilter");

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string | null>(
    ClockInSummaryFilterTypes.CLOCK_INS
  );

  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  }>(selectedFilters);

  const visibleFilterCount = 2;

  const filterTypeOptions = useMemo(
    () =>
      Object.keys(filterTypes).map((key) => ({
        label: key,
        value: key
      })),
    [filterTypes]
  );

  useEffect(() => {
    setAppliedFilters(selectedFilters);
  }, [selectedFilters]);

  const handleChipClick = (filterType: string, value: string | number) => {
    setAppliedFilters((prev) => {
      const values = prev[filterType] || [];
      const newValues = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const handleRemoveSelected = (filterType: string, value: string | number) => {
    setSelectedFilters((prev) => {
      const values = prev[filterType].filter((v) => v !== value);
      return { ...prev, [filterType]: values };
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(appliedFilters);
    setIsPopperOpen(false);
  };

  const handleResetFilters = () => {
    setAppliedFilters({});
    onResetFilters();
    setIsPopperOpen(false);
    setSelectedFilterType(ClockInSummaryFilterTypes.CLOCK_INS);
  };

  const handleFilterBtnClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorElement(event.currentTarget);
    setIsPopperOpen((prevState) => !prevState);
  };

  const filterSections = useMemo(
    () =>
      Object.entries(appliedFilters)
        .filter(([, values]) => values.length > 0)
        .map(([filterType, values]) => ({
          title: filterType,
          items: values.map((value) => {
            const label = filterTypes[filterType]?.find(
              (item) => item.value === value
            )?.label;
            return label || String(value);
          })
        })),
    [appliedFilters, filterTypes]
  );

  const totalFilterCount = useMemo(
    () =>
      Object.values(appliedFilters).reduce(
        (total, array) => total + array.length,
        0
      ),
    [appliedFilters]
  );

  return (
    <Stack sx={classes.wrapper}>
      <Stack sx={classes.container}>
        {Object.entries(selectedFilters)
          ?.flatMap(([filterType, values]) =>
            values?.map((value) => {
              const label = filterTypes[filterType]?.find(
                (item) => item.value === value
              )?.label;
              return { filterType, value, label };
            })
          )
          ?.slice(0, visibleFilterCount)
          ?.map(({ filterType, value, label }) => (
            <Chip
              key={value}
              label={label}
              sx={classes.filterItem}
              onDelete={() => handleRemoveSelected(filterType, value)}
              deleteIcon={
                <Box>
                  <CloseIcon fill={theme.palette.text.blackText} />
                </Box>
              }
            />
          ))}

        {Object.values(selectedFilters).reduce(
          (total, array) => total + array.length,
          0
        ) > visibleFilterCount && (
          <BasicChip
            label={`+${String(Object.values(selectedFilters).reduce((total, array) => total + array.length, 0) - visibleFilterCount)}`}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              border: "0.0625rem solid",
              borderColor: "grey.500",
              textTransform: "capitalize",
              color: "common.black",
              px: "1rem",
              py: "0.4375rem",
              lineHeight: "1.0625rem"
            }}
          />
        )}
        <Button
          buttonStyle={ButtonStyle.TERTIARY_OUTLINED}
          label={translateText(["placeholder"])}
          endIcon={<FilterIcon />}
          size={ButtonSizes.MEDIUM}
          onClick={(event: MouseEvent<HTMLElement>) =>
            handleFilterBtnClick(event)
          }
        />
      </Stack>

      <Popper
        anchorEl={anchorElement}
        open={isPopperOpen}
        position={position ?? "bottom-end"}
        id={id}
        handleClose={() => setIsPopperOpen(false)}
        containerStyles={classes.popperContainer2}
      >
        <AdvancedFilterStructure
          title={translateText(["placeholder"])}
          leftColumn={
            <FilterTypeList
              options={filterTypeOptions}
              selected={selectedFilterType ?? ""}
              setSelected={(value) => setSelectedFilterType(value as string)}
              firstColumnItems={firstColumnItems}
              secondColumnItems={secondColumnItems}
              getSecondColumnFirstKey={(filterType) => `${filterType}0`}
            />
          }
          centerColumn={
            <SelectableChipList
              title={selectedFilterType ?? undefined}
              items={
                selectedFilterType
                  ? (filterTypes[selectedFilterType] || []).map(
                      ({ label, value }) => ({ label, value })
                    )
                  : []
              }
              selectedValues={appliedFilters[selectedFilterType ?? ""] || []}
              onChipClick={(value) =>
                handleChipClick(selectedFilterType ?? "", value)
              }
              chipRefs={secondColumnItems}
            />
          }
          rightColumn={
            <SelectedFiltersDisplay
              filterSections={filterSections}
              headerText={`${totalFilterCount} ${translateText(["selected"])}`}
              noFiltersText={translateText(["noSelectedFilters"])}
            />
          }
          resetButtonProps={{
            onClick: handleResetFilters,
            children: translateText(["resetBtn"])
          }}
          applyButtonProps={{
            onClick: handleApplyFilters,
            children: translateText(["applyBtn"])
          }}
        />
      </Popper>
    </Stack>
  );
};

export default FilterButton;
