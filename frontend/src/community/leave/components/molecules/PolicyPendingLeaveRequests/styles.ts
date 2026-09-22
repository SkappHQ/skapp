import { SxProps, Theme } from "@mui/material/styles";

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

export const tableWrapperStyles = {
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0
};

export const stackStyles = (theme: Theme): SxProps<Theme> => ({
  py: 2,
  px: 2,
  backgroundColor: theme.palette.grey[100],
  "& button": {
    width: "9.875rem",
    height: "3rem"
  },
  borderBottomLeftRadius: "0.675rem",
  borderBottomRightRadius: "0.675rem"
});
