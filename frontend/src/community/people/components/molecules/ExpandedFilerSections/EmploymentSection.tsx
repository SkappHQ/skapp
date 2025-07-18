import { Stack } from "@mui/material";
import { RefObject } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { usePeopleStore } from "~community/people/store/store";
import { EmploymentAllocationTypes } from "~community/people/types/AddNewResourceTypes";
import {
  EmployeeDataFilterTypes,
  EmploymentStatusTypes,
  EmploymentTypes
} from "~community/people/types/EmployeeTypes";

import EmployeeFilterSection from "../EmployeeFilterSection/EmployeeFilterSection";

const EmploymentSection = ({
  selected,
  basicChipRef
}: {
  selected: string;
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
}) => {
  const translateText = useTranslator(
    "peopleModule",
    "peoples.filters.employementFilters"
  );

  const { employeeDataFilter, setEmployeeDataFilter } = usePeopleStore(
    (state) => state
  );

  type FilterKey = keyof EmployeeDataFilterTypes;

  const filterData: {
    title: string;
    data: { label: string; value: string }[];
    filterKey: FilterKey;
    accessibilityKey: string;
  }[] = [
    {
      title: "Employment Type",
      data: [
        { label: translateText(["intern"]), value: EmploymentTypes.INTERN },
        {
          label: translateText(["permenant"]),
          value: EmploymentTypes.PERMANENT
        },
        { label: translateText(["contract"]), value: EmploymentTypes.CONTRACT }
      ],
      filterKey: "employmentTypes",
      accessibilityKey: "employmentTypes"
    },
    {
      title: "Employment Allocation",
      data: [
        {
          label: translateText(["fullTime"]),
          value: EmploymentAllocationTypes.FULL_TIME
        },
        {
          label: translateText(["partTime"]),
          value: EmploymentAllocationTypes.PART_TIME
        }
      ],
      filterKey: "employmentTypes",
      accessibilityKey: "employmentAllocations"
    },
    {
      title: "Employment Status",
      data: [
        {
          label: translateText(["terminated"]),
          value: EmploymentStatusTypes.TERMINATED
        },
        {
          label: translateText(["pending"]),
          value: EmploymentStatusTypes.PENDING
        }
      ],
      filterKey: "employmentTypes",
      accessibilityKey: "accountStatus"
    }
  ];

  const handleFilterChange = (
    value: string,
    accessibilityKey: string,
    currentFilter: string[]
  ) => {
    if (!currentFilter.includes(value)) {
      setEmployeeDataFilter(accessibilityKey, [...currentFilter, value]);
    } else {
      setEmployeeDataFilter(
        accessibilityKey,
        currentFilter.filter((currentItem) => currentItem !== value)
      );
    }
  };

  return (
    <Stack
      sx={{
        overflowY: "auto",
        flexDirection: "column",
        maxHeight: "20rem"
      }}
    >
      {filterData.map((filter) => {
        return (
          <EmployeeFilterSection
            basicChipRef={basicChipRef}
            selected={selected}
            key={filter.title}
            title={filter.title}
            accessibilityKey={filter.accessibilityKey}
            data={filter.data}
            handleFilterChange={handleFilterChange}
            currentFilter={employeeDataFilter[filter.accessibilityKey] ?? []}
          />
        );
      })}
    </Stack>
  );
};

export default EmploymentSection;
