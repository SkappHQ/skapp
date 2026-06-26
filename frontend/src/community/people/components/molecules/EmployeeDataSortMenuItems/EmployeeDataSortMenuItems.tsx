import { Box } from "@mui/material";
import { JSX } from "react";

import SortRow from "~community/common/components/atoms/SortRow/SortRow";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  handleClose: () => void;
  scrollToTop?: () => void;
}

const EmployeeDataSortMenuItems = ({
  handleClose,
  scrollToTop
}: Props): JSX.Element => {
  const sortKey = usePeopleStore((state) => state.employeeDataParams.sortKey);
  const sortOrder = usePeopleStore(
    (state) => state.employeeDataParams.sortOrder
  );
  const handleEmployeeDataSort = usePeopleStore(
    (state) => state.handleEmployeeDataSort
  );
  const translateText = useTranslator("peopleModule", "peoples");

  return (
    <Box sx={{ backgroundColor: "common.white" }}>
      <SortRow
        text={translateText(["sortAlphabeticalAsc"])}
        selected={
          sortKey === SortKeyTypes.NAME && sortOrder === SortOrderTypes.ASC
        }
        onClick={() => {
          handleEmployeeDataSort("sortKey", SortKeyTypes.NAME);
          handleEmployeeDataSort("sortOrder", SortOrderTypes.ASC);
          handleClose();
          scrollToTop?.();
        }}
      />
      <SortRow
        text={translateText(["sortAlphabeticalDesc"])}
        selected={
          sortKey === SortKeyTypes.NAME && sortOrder === SortOrderTypes.DESC
        }
        onClick={() => {
          handleEmployeeDataSort("sortKey", SortKeyTypes.NAME);
          handleEmployeeDataSort("sortOrder", SortOrderTypes.DESC);
          handleClose();
          scrollToTop?.();
        }}
      />
    </Box>
  );
};

export default EmployeeDataSortMenuItems;
