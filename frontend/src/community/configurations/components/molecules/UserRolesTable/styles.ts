import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "2rem"
  },
  moduleChipStyles: {
    backgroundColor: theme.palette.secondary.main
  },
  roleChipStyles: (index: number, lastItemIndex: number) => ({
    marginRight: index !== lastItemIndex ? "0.625rem" : 0,
    border: `1px solid ${theme.palette.grey[500]}`,
    backgroundColor: theme.palette.grey[50]
  })
});

export default styles;
