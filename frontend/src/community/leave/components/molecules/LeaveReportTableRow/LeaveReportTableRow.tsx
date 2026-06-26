import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { leaveEntitlementReportDtosType } from "~community/leave/types/LeaveReportTypes";

import { tableRowStyles } from "./styles";

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}
interface Props {
  employee: Employee;
  allocations: leaveEntitlementReportDtosType[];
}
const LeaveReportTableRow: FC<Props> = ({ employee, allocations }) => {
  const theme: Theme = useTheme();

  const styles = tableRowStyles(theme);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={styles.rowContainer}
    >
      <Box sx={styles.stickyColumn}>
        {employee?.firstName && employee?.lastName ? (
          <AvatarChip
            firstName={employee?.firstName}
            lastName={employee?.lastName}
            avatarUrl={employee?.avatarUrl}
            isResponsiveLayout={true}
            chipStyles={{
              maxWidth: "100%",
              justifyContent: "flex-start"
            }}
            mediumScreenWidth={1024}
            smallScreenWidth={0}
          />
        ) : null}
      </Box>
      {allocations?.map((allocation: any, index: number) => (
        <Box key={index} sx={styles.cell}>
          <Typography sx={styles.holidayText}>
            {allocation?.allocation}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default LeaveReportTableRow;
