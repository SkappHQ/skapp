import { Theme } from "@mui/material";

const styles = (theme: Theme) => ({
  wrapper: {
    display: "flex",
    height: "14rem",
    border: "none",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    margin: "auto",
    textAlign: "center"
  },
  titleWrapper: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing(1),
    alignItems: "center"
  }
});

export default styles;
