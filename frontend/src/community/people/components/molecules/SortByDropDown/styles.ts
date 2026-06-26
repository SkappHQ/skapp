import { StyleProps } from "~community/common/types/CommonTypes";

export const styles = (): StyleProps => ({
  wrapper: {
    flexDirection: "row",
    gap: "0.625rem"
  },
  sortButton: {
    border: "0.0625rem solid",
    borderColor: "grey.500",
    fontWeight: "400",
    fontSize: "0.875rem",
    py: "0.5rem",
    px: "1rem"
  }
});
