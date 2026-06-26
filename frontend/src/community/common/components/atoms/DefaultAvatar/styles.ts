import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  avatarContainer: {
    borderRadius: "50%",
    p: 0,
    m: 0,
    width: "2.5rem",
    height: "2.5rem",
    backgroundColor: "grey.100",
    color: "grey.500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "0.125rem solid",
    borderColor: "grey.700"
  },
  typography: {
    color: "black"
  },
  icon: {
    color: "white",
    width: "100%",
    height: "100%"
  }
});

export default styles;
