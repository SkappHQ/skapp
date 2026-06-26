import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  avatarChip: {
    color: "common.black",
    p: 0,
    "& .MuiChip-label": {
      width: "7rem"
    },
    fontSize: "1rem"
  },
  jobTitle: {
    width: "6.25rem"
  },
  btnWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },
  dropDownBtn: {
    p: "0.625rem 1rem",
    lineHeight: "1rem",
    fontSize: "0.875rem"
  },
  popper: {
    maxHeight: "10.5rem",
    overflow: "auto"
  }
});

export default styles;
