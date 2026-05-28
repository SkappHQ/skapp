import {
  AdvancedFilterStructure,
  Popper,
  SelectableItemList,
  SelectableList,
  SelectedFiltersDisplay
} from "@rootcodelabs/skapp-ui";
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
import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { PopperAndTooltipPositionTypes } from "~community/common/types/MoleculeTypes";

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
  selectedFilters
}: FilterPanelProps): JSX.Element => {
  const firstColumnItems = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const secondColumnItems = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );

  const translateText = useTranslator("commonComponents", "advanceFilter");

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const [isPopperOpen, setIsPopperOpen] = useState<boolean>(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string | null>(
    ClockInSummaryFilterTypes.CLOCK_INS
  );

  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  }>(selectedFilters);

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

  const selectedFilterCount = useMemo(
    () =>
      Object.values(selectedFilters).reduce(
        (total, array) => total + array.length,
        0
      ),
    [selectedFilters]
  );

  return (
    <div className="flex flex-row">
      <div className="flex flex-row gap-1 items-center">
        <FilterIconButton
          filterCount={selectedFilterCount}
          aria-label={translateText(["placeholder"])}
          onClick={(event: MouseEvent<HTMLElement>) =>
            handleFilterBtnClick(event)
          }
        />
      </div>

      <Popper
        anchorEl={anchorElement}
        open={isPopperOpen}
        position={position ?? "bottom-end"}
        id={id}
        handleClose={() => setIsPopperOpen(false)}
        containerClassName="w-[832px] rounded-4 shadow-lg"
      >
        <AdvancedFilterStructure
          title={translateText(["placeholder"])}
          leftColumn={
            <SelectableList
              options={filterTypeOptions}
              selected={selectedFilterType ?? ""}
              setSelected={(value) => setSelectedFilterType(value as string)}
              firstColumnItems={firstColumnItems}
              secondColumnItems={secondColumnItems}
              getSecondColumnFirstKey={(filterType) => `${filterType}0`}
            />
          }
          centerColumn={
            <SelectableItemList
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
    </div>
  );
};

export default FilterButton;
