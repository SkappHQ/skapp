import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (
  theme: Theme,
  isDisableColor: boolean,
  validationError: boolean
): StyleProps => ({
  labelText: {
    marginTop: "1.25rem",
    marginBottom: "0.3125rem",
    lineHeight: 1.5,
    fontWeight: 500
  },
  dragDropContainer: {
    border: isDisableColor
      ? `0.0625rem dashed ${theme.palette.grey.A100}`
      : validationError
        ? `0.0625rem dashed ${theme.palette.error.contrastText}`
        : `0.0625rem dashed ${theme.palette.grey.A100}`,
    borderRadius: "0.5rem",
    justifyContent: "center",
    textAlign: "center" as "center",
    paddingTop: "2.4375rem",
    paddingBottom: "2.25rem",
    width: "100%",
    background: "transparent",
    color: validationError
      ? theme.palette.error.contrastText
      : theme.palette.common.black,
    maxHeight: "13.375rem",
    overflowY: "auto" as "auto" | "hidden" | "scroll"
  },
  orText: {
    color: theme.palette.grey[700]
  },
  browseText: {
    color: validationError
      ? theme.palette.error.contrastText
      : theme.palette.primary.dark,
    textDecoration: "underline",
    cursor: "pointer"
  },
  IconChip: {
    maxWidth: "18.75rem",
    backgroundColor: "transparent",
    "& .MuiChip-label": {
      pl: "0.625rem"
    },
    ".MuiChip-deleteIcon": {
      color: "black"
    },
    fontWeight: 400,
    fontSize: "1rem",
    color: "common.black",
    whiteSpace: "nowrap",
    overflow: "hidden !important",
    textOverflow: "ellipsis"
  },
  supportedFileText: {
    mt: "2rem",
    fontWeight: "400",
    color: theme.palette.grey[700]
  },
  errorText: {
    color: theme.palette.error.contrastText,
    mt: 1
  },
  desTextStyle: {
    color: theme.palette.grey[700]
  }
});
