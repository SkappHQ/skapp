import { Theme } from "@mui/material";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  labelWrapper: {
    paddingRight: "0.875rem",
    justifyContent: "space-between"
  },
  errorText: {
    marginTop: "0.3rem"
  },
  popper: {
    zIndex: ZIndexEnums.POPOVER,
    marginTop: "0.1875rem !important",
    marginBottom: "0.1875rem !important"
  },
  fullDayLeave: {
    border: `0.125rem solid ${theme.palette.error.contrastText}`
  },
  halfDayMorningLeave: {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderLeft: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderTop: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderBottom: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderRadius: "50%",
      clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)"
    }
  },
  halfDayEveningLeave: {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRight: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderTop: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderBottom: `0.125rem solid ${theme.palette.error.contrastText}`,
      borderRadius: "50%",
      clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)"
    }
  }
});

export default styles;
