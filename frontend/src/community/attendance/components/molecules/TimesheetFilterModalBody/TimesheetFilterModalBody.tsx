import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useState } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { FilterChipType } from "~community/attendance/types/timeSheetTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  onApply: (
    selectedFilters: Record<string, string[]>,
    selectedFilterLabels: string[]
  ) => void;
  onReset: () => void;
  isManager?: boolean;
}

const TimesheetFilterModalBody = ({
  onApply,
  onReset,
  isManager = false
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const {
    employeeTimesheetRequestsFilterValues,
    employeeSelectedTimesheetFilterLabels,
    employeeTimesheetRequestsFilters,
    timesheetRequestsFilterValues,
    timesheetRequestsFilters,
    selectedTimesheetFilterLabels
  } = useAttendanceStore((state) => state);

  const filterLabels = isManager
    ? selectedTimesheetFilterLabels
    : employeeSelectedTimesheetFilterLabels;
  const filterValues = isManager
    ? timesheetRequestsFilterValues
    : employeeTimesheetRequestsFilterValues;
  const filters = isManager
    ? timesheetRequestsFilters
    : employeeTimesheetRequestsFilters;

  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const onClickFilter = (category: string, filter: FilterChipType) => {
    const filterLabelIndex = selectedFilterLabels?.findIndex(
      (label) => label === filter?.label
    );
    const filterLabelCopy = [...selectedFilterLabels];
    if (filterLabelIndex < 0) {
      setSelectedFilterLabels([...selectedFilterLabels, filter?.label]);
    } else {
      filterLabelCopy.splice(filterLabelIndex, 1);
      setSelectedFilterLabels(filterLabelCopy);
    }

    const selectedFiltersCopy = { ...selectedFilters };
    if (
      selectedFiltersCopy?.[category] &&
      Array.isArray(selectedFiltersCopy?.[category])
    ) {
      const index = selectedFiltersCopy[category]?.indexOf(filter?.value);
      if (index !== -1) {
        selectedFiltersCopy[category]?.splice(index, 1);
      } else {
        selectedFiltersCopy[category]?.push(filter?.value);
      }
    } else {
      selectedFiltersCopy[category] = [filter?.value];
    }
    setSelectedFilters(selectedFiltersCopy);
  };

  useEffect(() => {
    if (filterLabels?.length > 0) {
      setSelectedFilterLabels(filterLabels);
    }
  }, [filterLabels]);

  useEffect(() => {
    if (Object.keys(filters)?.length > 0) {
      setSelectedFilters(filters);
    }
  }, [filters]);

  return (
    <BasicFilterStructure
      title={translateText(["filterTitle"])}
      resetButtonProps={{
        onClick: onReset,
        disabled: selectedFilterLabels?.length === 0,
        children: translateText(["resetBtnTxt"])
      }}
      applyButtonProps={{
        onClick: () => onApply(selectedFilters, selectedFilterLabels),
        children: translateText(["applyBtnTxt"]),
        "aria-label": "Apply filters"
      }}
    >
      <SelectableItemList
        title={translateText(["statusFilterTitle"])}
        items={
          filterValues?.status?.map((status: FilterChipType) => ({
            label: status?.label ?? "",
            value: status?.label ?? ""
          })) ?? []
        }
        selectedValues={selectedFilterLabels}
        onChipClick={(statusLabel) => {
          const status = filterValues?.status?.find(
            (s: FilterChipType) => s?.label === statusLabel
          );
          if (status) {
            onClickFilter("status", status);
          }
        }}
      />
    </BasicFilterStructure>
  );
};

export default TimesheetFilterModalBody;
