import { IconButton, type IconButtonProps } from "@mui/material";
import { styled } from "@mui/system";

export const CSIconButton = styled(IconButton)<IconButtonProps>(
  ({ theme }) => ({
    bgcolor: theme.palette.grey[200],
    px: "1.125rem",
    py: "0.75rem",
    borderRadius: "4rem",
    mr: 0,
    "&.Mui-disabled": {
      backgroundColor: theme.palette.grey[100],
      boxShadow: `inset 0 0 0 0.0625rem ${theme.palette.grey[300] as string}`,
      outline: "none",

      "svg path": {
        fill: theme.palette.grey[800]
      }
    },
    "&:focus-visible": {
      outline: `0.125rem solid ${theme.palette.common.black}`
    }
  })
);
