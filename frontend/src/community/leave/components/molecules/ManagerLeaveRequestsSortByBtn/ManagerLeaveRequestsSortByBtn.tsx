import { Box, SelectChangeEvent, Typography } from "@mui/material";

import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortKeyTypes } from "~community/common/types/CommonTypes";
import { useLeaveStore } from "~community/leave/store/store";

const ManagerLeaveRequestsSortByBtn = () => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestSort"
  );
  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const leaveRequestSort = useLeaveStore(
    (state) => state.leaveRequestParams.sortKey
  );

  const { handleLeaveRequestsSort } = useLeaveStore((state) => state);

  const dropdownItems = [
    {
      label: translateText(["dateRequested"]),
      value: SortKeyTypes.CREATED_DATE
    },
    {
      label: translateText(["leaveDate"]),
      value: SortKeyTypes.START_DATE
    }
  ];

  const handleItemClick = (event: SelectChangeEvent) => {
    handleLeaveRequestsSort("sortKey", event.target.value);
  };

  const selectedItem = dropdownItems.find(
    (item) => item.value === leaveRequestSort
  );

  return (
    <Box role="group" aria-label={translateAria(["sortGroup"])}>
      <RoundedSelect
        id="all-leave-requests-filter"
        onChange={handleItemClick}
        value={selectedItem?.value ?? ""}
        options={dropdownItems}
        renderValue={(selectedValue: string) => (
          <Typography
            aria-label={translateAria(["sortBy"], {
              sortBy: selectedValue
            })}
          >
            {translateText(["sortBy"])}
          </Typography>
        )}
      />
    </Box>
  );
};

export default ManagerLeaveRequestsSortByBtn;
