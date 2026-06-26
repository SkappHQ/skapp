import { MenuItem, Theme, styled } from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";

interface StyleProps {
  container: (width: string, button: boolean) => object;
}

export const styles = (theme: Theme): StyleProps => ({
  container: (width: string, button: boolean) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      border: `0.0625rem solid ${theme.palette.grey.A100}`,
      maxWidth: width,
      borderRadius: button ? "0.75rem" : undefined
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.white,
      "&::before": {
        backgroundColor: theme.palette.common.white,
        border: `0.0625rem solid ${theme.palette.grey.A100}`
      }
    }
  })
});

export const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== "isSoftDisabled"
})<{ isSoftDisabled: boolean }>(({ theme, isSoftDisabled }) => ({
  padding: "12px 16px",

  justifyContent: "space-between",
  borderRadius: "0.75rem",

  "&.Mui-selected": {
    backgroundColor: theme.palette.secondary.main,
    border: "0.0625rem solid",
    borderColor: theme.palette.grey[300],
    color: theme.palette.primary.dark,

    svg: {
      fill: theme.palette.primary.dark,

      path: {
        fill: theme.palette.primary.dark
      }
    }
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey.A100
  },
  ...(isSoftDisabled && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey.A100,
    ":hover": {
      backgroundColor: "none"
    }
  })
}));
