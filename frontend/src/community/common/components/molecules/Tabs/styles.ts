import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  tabsContainer: {
    width: "100%"
  },
  tabsBox: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: "fit-content"
  },
  tab: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 400,
    fontSize: "1rem",
    color: theme.palette.text.primary,
    "&.Mui-selected": {
      fontWeight: 600,
      color: theme.palette.text.blackText
    }
  },
  indicator: {
    backgroundColor: theme.palette.primary.dark
  },
  tabPanelBox: {
    padding: "1rem 0rem"
  }
});

export default styles;
