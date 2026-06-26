import { Box } from "@mui/material";
import { JSX } from "react";

import SortRow from "~community/common/components/atoms/SortRow/SortRow";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortKeyTypes } from "~community/common/types/CommonTypes";
import { useLeaveStore } from "~community/leave/store/store";

interface Props {
  handleClose: () => void;
}
const LALeaveRequestSortMenuItems = ({ handleClose }: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestSort"
  );

  const { handleLeaveRequestsSort, leaveRequestParams } = useLeaveStore(
    (state) => state
  );

  return (
    <Box sx={{ backgroundColor: "common.white" }}>
      <SortRow
        text={translateText(["dateRequested"])}
        selected={leaveRequestParams.sortKey === SortKeyTypes.CREATED_DATE}
        onClick={() => {
          handleLeaveRequestsSort("sortKey", SortKeyTypes.CREATED_DATE);
          handleClose();
        }}
      />
      <SortRow
        text={translateText(["leaveDate"])}
        selected={leaveRequestParams.sortKey === SortKeyTypes.START_DATE}
        onClick={() => {
          handleLeaveRequestsSort("sortKey", SortKeyTypes.START_DATE);
          handleClose();
        }}
      />
    </Box>
  );
};

export default LALeaveRequestSortMenuItems;
