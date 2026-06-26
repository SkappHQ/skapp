import { Theme } from "@mui/material/styles";

const styles = (theme: Theme) => ({
  container: () => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "0.25rem",
    gap: "0.25rem",
    backgroundColor: theme.palette.grey[200],
    borderRadius: "3.625rem"
  }),
  text: (selected?: boolean) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    height: "1.5rem",
    borderRadius: "4rem",
    padding: "0.25rem 0.75rem",
    fontWeight: 400,
    fontSize: "0.875rem",
    color: selected ? "common.black" : theme.palette.text.textBurntGrey,
    gap: "0.5rem",
    userSelect: "none",
    mozUserSelect: "none",
    webkitUserSelect: "none",
    msUserSelect: "none",
    backgroundColor: selected
      ? theme.palette.grey[100]
      : theme.palette.grey[200]
  })
});
export default styles;
