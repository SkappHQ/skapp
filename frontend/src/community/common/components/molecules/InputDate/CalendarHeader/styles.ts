import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0.75rem 0.25rem 1.5rem"
  },
  iconWrapper: {
    flexDirection: "row"
  },
  iconContainer: { padding: "0.5rem" }
});

export default styles;
