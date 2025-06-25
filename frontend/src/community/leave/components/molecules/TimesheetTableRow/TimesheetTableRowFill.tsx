import { Box, Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface Props {
  noOfRows: number;
}

const TimesheetTableRowFill: FC<Props> = ({ noOfRows }) => {
  const theme: Theme = useTheme();

  return (
    <Box sx={{ position: "relative" }}>
      {[...Array(noOfRows)].map((_item, index) => (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: "100%",
            height: "4.3rem",
            background: theme.palette.grey[50],
            borderWidth: "0.063rem 0rem",
            borderStyle: "solid",
            borderColor: theme.palette.grey[100],
            position: "absolute",
            zIndex: ZIndexEnums.MIN
          }}
          key={index}
        ></Stack>
      ))}
    </Box>
  );
};

export default TimesheetTableRowFill;
