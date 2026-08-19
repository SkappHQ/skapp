import { StyleProps } from "~community/common/types/CommonTypes";

// The outer wrapper and the overlay each space their own sections; both must use
// the same gap for the whole tab to read as one evenly spaced list.
const SECTION_GAP = "1.5rem";

const styles = (): StyleProps => ({
  container: {
    padding: "0rem",
    margin: "0rem auto",
    height: "auto"
  },
  sectionsWrapper: {
    gap: SECTION_GAP,
    padding: "0.25rem"
  },
  customContainerStyles: {
    gap: SECTION_GAP,
    padding: "0rem"
  }
});

export default styles;
