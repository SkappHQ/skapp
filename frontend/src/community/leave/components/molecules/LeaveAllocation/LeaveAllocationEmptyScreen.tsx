import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";

import TableEmptyScreen from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useLeaveStore } from "~community/leave/store/store";

import styles from "./styles";

const LeaveAllocationEmptyScreen = () => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leaveAllocation",
    "emptyScreen"
  );

  const { selectedYear } = useLeaveStore((state) => state);

  return (
    <Box sx={classes.innerBox}>
      <TableEmptyScreen
        title={translateText(["title"], {
          year: selectedYear
        })}
        description={translateText(["description"])}
        customStyles={{
          description: { width: "100%" }
        }}
      />
    </Box>
  );
};

export default LeaveAllocationEmptyScreen;
