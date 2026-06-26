import { type Theme } from "@mui/material";

import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (theme: Theme): StyleProps => ({
  checkBox: {
    p: 0,
    color: theme.palette.primary.main,
    "&.Mui-checked": {
      color: theme.palette.primary.main
    }
  },
  avatarChip: {
    color: "common.black",
    p: 0,
    ml: ".875rem"
  },
  jobTitle: {
    ml: ".75rem",
    fontSize: ".75rem",
    fontWeight: 400,
    color: theme.palette.primary.dark
  },
  userList: {
    mr: "1.25rem",
    mt: ".75rem"
  }
});

export default styles;
