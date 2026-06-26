import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%"
  },
  contentWrapper: {
    height: "max-content",
    width: "100%",
    boxSizing: "border-box",
    padding: "1.25rem 0rem",
    backgroundColor: "grey.50",
    borderRadius: "0.9375rem"
  },
  divider: {
    margin: "0.5rem 1.25rem 1.25rem 1.25rem"
  },
  textWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    boxSizing: "border-box",
    width: "100%",
    gap: { xs: "0.5rem", sm: "1rem" },
    paddingX: "1.25rem"
  },
  membersCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: { xs: "5rem", sm: "10.625rem" },
    gap: { xs: "0rem", sm: "0.75rem" },
    overflow: "hidden",
    fontSize: { xs: "0.875rem", sm: "1rem" }
  },
  membersName: {
    visibility: { xs: "hidden", sm: "visible" }
  },
  dropDownCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: {
      xs: "calc(calc(100% - 6rem) / 2)",
      sm: "calc(calc(100% - 12.625rem) / 2)"
    }
  },
  dropdownBtnStyles: {
    width: "100%",
    justifyContent: "space-between"
  },
  seeMoreStyles: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  dropDownTextStyles: {
    fontSize: "0.875rem"
  },
  bodyWrapper: {
    width: "100%",
    overflowY: "auto",
    maxHeight: { xs: "12.5rem", sm: "16.125rem" }
  },
  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    height: "max-content",
    width: "100%",
    gap: "0.75rem"
  }
});

export default styles;
