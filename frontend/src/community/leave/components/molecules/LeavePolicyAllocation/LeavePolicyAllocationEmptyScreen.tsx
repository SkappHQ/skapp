import { Box } from "@mui/material";

import TableEmptyScreen from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";

const LeavePolicyAllocationEmptyScreen = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "emptyScreen"
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TableEmptyScreen
        title={translateText(["title"])}
        description={translateText(["description"])}
        customStyles={{
          description: { width: "100%" }
        }}
      />
    </Box>
  );
};

export default LeavePolicyAllocationEmptyScreen;
