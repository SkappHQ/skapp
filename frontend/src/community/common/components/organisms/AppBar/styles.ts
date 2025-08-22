import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = () => ({
  wrapper: {
    position: "sticky",
    top: 0,
    right: 0,
    backgroundColor: "common.white",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: {
      xs: "1.875rem 2rem",
      lg: "1.875rem 3rem 0.1875rem 3rem"
    },
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "103.125rem",
    height: "min-content",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
    zIndex: ZIndexEnums.APP_BAR,
    margin: "0 auto"
  },
  container: {
    flexDirection: "row",
    width: { xs: "calc(100% - 4.5rem)", lg: "100%" },
    justifyContent: "space-between"
  },
  userInfoPanelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: "1.5rem",
    height: "4rem",
    width: "auto",
    padding: "1rem",
    borderRadius: "3.3125rem",
    backgroundColor: "grey.100"
  },
  menuIconBtn: {
    display: { xs: "flex", lg: "none" }
  },
  appBarMenuWrapper: {
    zIndex: ZIndexEnums.APP_BAR,
    position: "fixed"
  }
});

export default styles;
