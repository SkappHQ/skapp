import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (): StyleProps => ({
  container: {
    width: "80%",
    maxWidth: "37.5rem"
  },
  textInputStyle: { marginTop: "1.25rem" },
  validationContainer: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-between",
    rowGap: "1rem"
  },
  leftContainer: {
    width: "48%",
    display: "flex",
    flexDirection: "column",
    rowGap: "0.75rem"
  },
  rightContainer: {
    width: "48%",
    display: "flex",
    flexDirection: "column",
    rowGap: "0.75rem"
  },
  validationItem: {
    display: "flex",
    alignItems: "center"
  }
});
