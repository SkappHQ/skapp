import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (): StyleProps => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyItems: "center",
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    py: "0.625rem"
  },
  headerContainer: {
    maxWidth: "37.5rem",
    marginBottom: "2rem",
    width: "80%"
  },
  logo: {
    marginBottom: "1.75rem"
  },
  subHeader: {
    fontWeight: 400,
    fontSize: "1rem",
    marginTop: "1.5625rem"
  },
  button: {
    px: "2.5rem",
    width: "80%",
    fontWeight: 400,
    marginTop: "2.5rem",
    maxWidth: "37.5rem"
  }
});
