import { Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const TableHeaderFill = (): JSX.Element => {
  const theme: Theme = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{
        padding: "0.5rem 0rem",
        width: "100%",
        height: "4.3rem",
        background: theme.palette.grey[100],
        position: "absolute",
        pt: "0.75rem",
        zIndex: ZIndexEnums.MIN
      }}
    ></Stack>
  );
};

export default TableHeaderFill;
