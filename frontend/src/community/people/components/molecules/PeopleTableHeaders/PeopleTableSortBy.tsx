import { Box, SelectChangeEvent, Typography } from "@mui/material";

import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { usePeopleStore } from "~community/people/store/store";

const PeopleTableSortBy = ({ sortType }: { sortType: string }) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const translateAria = useTranslator("peopleAria", "directory");

  const sortOrder = usePeopleStore(
    (state) => state.employeeDataParams.sortOrder
  );

  const handleEmployeeDataSort = usePeopleStore(
    (state) => state.handleEmployeeDataSort
  );

  const dropdownItems = [
    {
      label: translateText(["sortAlphabeticalAsc"]),
      value: SortOrderTypes.ASC
    },
    {
      label: translateText(["sortAlphabeticalDesc"]),
      value: SortOrderTypes.DESC
    }
  ];

  const handleItemClick = (event: SelectChangeEvent) => {
    handleEmployeeDataSort("sortKey", SortKeyTypes.NAME);
    handleEmployeeDataSort("sortOrder", event.target.value);
  };

  const selectedItem = dropdownItems.find((item) => item.value === sortOrder);

  return (
    <Box>
      <RoundedSelect
        id="people-table-sort-by"
        onChange={handleItemClick}
        value={selectedItem?.value ?? ""}
        options={dropdownItems}
        renderValue={(selectedValue: string) => {
          const selectedOption = dropdownItems.find(
            (item) => item.value === selectedValue
          );
          const displayLabel = selectedOption?.label || selectedValue;
          return (
            <Typography
              aria-label={translateAria(["sortBy"], {
                sortBy: displayLabel
              })}
            >
              {translateText(["sortBy"], {
                sortBy: sortType
              })}
            </Typography>
          );
        }}
        accessibility={{
          label: translateAria(["sortDropdown"])
        }}
      />
    </Box>
  );
};

export default PeopleTableSortBy;
