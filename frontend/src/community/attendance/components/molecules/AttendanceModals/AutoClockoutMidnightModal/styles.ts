import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  container: {
    pt: "0.75rem",
    maxHeight: "50vh",
    overflow: "auto"
  },
  headerText: {
    fontSize: ".875rem",
    pb: "0.5rem"
  },
  bodyContainer: {
    pb: "1rem"
  },
  iconChipStyles: {
    backgroundColor: "grey.100",
    minWidth: "6rem",
    py: "0.75rem"
  },
  workHourStyles: {
    fontSize: ".875rem"
  },
  basicChipStyles: {
    backgroundColor: "grey.100",
    py: "0.75rem"
  }
});

export default styles;
