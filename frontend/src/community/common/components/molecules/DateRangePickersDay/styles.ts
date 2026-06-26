import { Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  pickersDay: {
    "&.Mui-full-day-holiday": {
      backgroundColor: theme.palette.grey[200]
    },
    "&.Mui-half-day-morning-holiday": {
      background: `linear-gradient(90deg, ${theme.palette.grey[200]} 50%, transparent 50%)`
    },
    "&.Mui-half-day-evening-holiday": {
      background: `linear-gradient(90deg, transparent 50%, ${theme.palette.grey[200]} 50%)`
    },
    "&.Mui-full-day-leave": {
      border: `0.125rem solid ${theme.palette.error.contrastText}`
    },
    "&.Mui-half-day-morning-leave": {
      position: "relative",
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "50%",
      backgroundColor: "transparent",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `0.125rem solid ${theme.palette.error.contrastText}`,
        clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
        boxSizing: "border-box"
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `0.125rem solid ${theme.palette.error.contrastText}`,
        clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
        boxSizing: "border-box"
      }
    },
    "&.Mui-half-day-evening-leave": {
      position: "relative",
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "50%",
      backgroundColor: "transparent",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `0.125rem solid ${theme.palette.error.contrastText}`,
        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
        boxSizing: "border-box"
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `0.125rem solid ${theme.palette.error.contrastText}`,
        clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
        boxSizing: "border-box"
      }
    },
    "&.Mui-user-selection": {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white
    },
    "&.Mui-full-day-range-selection": {
      backgroundColor: theme.palette.primary.main
    },
    "&.Mui-half-day-morning-range-selection": {
      background: `linear-gradient(90deg, ${theme.palette.primary.main} 50%, transparent 50%)`
    },
    "&.Mui-half-day-evening-range-selection": {
      background: `linear-gradient(90deg, transparent 50%, ${theme.palette.primary.main} 50%)`
    },
    "&:hover": {
      backgroundColor: theme.palette.secondary.main
    }
  }
});

export default styles;
