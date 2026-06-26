import { Theme } from "@mui/material/styles";

export const tableHeaderRowStyles = (theme: Theme) => ({
  bgcolor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`
});

export const tableHeaderCellStyles = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontWeight: 600
});

export const tableContainerStyles = (theme: Theme) => ({
  bgcolor: theme.palette.background.paper,
  borderRadius: "0.625rem"
});

export const typographyStyles = (theme: Theme) => ({
  color: theme.palette.common.black,
  fontSize: "0.875rem",
  fontWeight: "600",
  lineHeight: "1.3125rem"
});
