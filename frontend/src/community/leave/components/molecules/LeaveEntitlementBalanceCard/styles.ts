import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  wrapper: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.25rem",
    boxSizing: "border-box"
  },
  row: {
    flexDirection: "row",
    gap: "1.25rem"
  },
  text: {
    width: "7.5rem"
  }
});

export default styles;
