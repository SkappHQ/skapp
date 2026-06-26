import { Theme } from "@mui/material";

const styles = () => ({
  container: {
    width: "100%",
    height: "100%",
    gap: "2rem"
  },
  sectionContainer: {
    width: "100%",
    height: "100%",
    gap: "1.5rem"
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  sectionDescription: {
    fontSize: "1rem",
    lineHeight: "1.6rem",
    fontWeight: 400,
    color: (theme: Theme) => theme.palette.text.secondary
  },
  dayChipContainer: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    gap: "0.75rem"
  },
  divider: {
    width: "100%",
    backgroundColor: (theme: Theme) => theme.palette.divider
  },
  middleContainer: {
    flexDirection: { xs: "column", sm: "row" },
    flexWrap: "wrap",
    width: "100%",
    gap: "2rem"
  },
  dropdownContainer: {
    flexDirection: "column",
    width: "100%",
    maxWidth: "28.125rem",
    gap: "1.5rem"
  },
  inputField: {
    maxWidth: "28.125rem"
  },
  halfDayInput: {
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    width: "100%"
  },
  halfDayBox: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    width: "100%"
  },
  halfDayLabel: {
    fontSize: "1rem",
    lineHeight: "1.6rem",
    fontWeight: 400,
    color: (theme: Theme) => theme.palette.text.secondary
  },
  buttonContainer: {
    flexDirection: { xs: "column", sm: "row" },
    height: "max-content",
    gap: "0.75rem"
  },
  resetButton: {
    width: { xs: "100%", sm: "8.75rem" }
  },
  saveButton: {
    width: { xs: "100%", sm: "13.75rem" }
  }
});

export default styles;
