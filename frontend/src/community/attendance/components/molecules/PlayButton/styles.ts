import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  buttonComponent: {
    border: "none",
    borderRadius: "50%",
    width: "1.5rem",
    height: "1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default styles;
