import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = () => ({
  userInfoPanelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: "1.75rem",
    width: "auto",
    padding: "0.375rem 0.625rem",
    borderRadius: "3.3125rem"
  },
  appBarMenuWrapper: {
    zIndex: ZIndexEnums.APP_BAR,
    position: "fixed"
  }
});

export default styles;
