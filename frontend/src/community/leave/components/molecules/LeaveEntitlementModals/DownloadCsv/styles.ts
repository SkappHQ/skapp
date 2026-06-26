import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  wrapper: {
    borderRadius: "0.75rem",
    height: "100%"
  },
  description: {
    py: "0.5rem"
  },
  divider: { my: "1rem" },
  downloadBtn: {
    mt: "0.75rem",
    ".MuiButton-endIcon": {
      "svg path": {
        fill: "none"
      }
    }
  },
  nextBtn: { mb: "0.5rem" }
});

export default styles;
