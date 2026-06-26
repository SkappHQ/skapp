import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  label: {
    fontWeight: 500,
    color: "common.black",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
  },
  paper: {
    width: "100%",
    backgroundColor: "grey.100",
    mt: "0.5rem",
    pl: "0.5rem",
    height: "3rem",
    borderRadius: "0.5rem",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    zIndex: ZIndexEnums.DEFAULT
  }
});

export default styles;
