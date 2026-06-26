import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: { xs: "6.25rem", sm: "12.5rem" }
  },
  textWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default styles;
