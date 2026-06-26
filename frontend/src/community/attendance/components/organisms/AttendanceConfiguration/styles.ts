import { theme } from "~community/common/theme/theme";

const styles = () => ({
  container: {
    width: "100%",
    maxWidth: "32.875rem"
  },
  sectionTitle: {
    marginBottom: "1rem",
    fontWeight: 700,
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  sectionDescription: {
    fontSize: "1rem",
    lineHeight: "1.6rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginBottom: "1rem"
  },
  switchWrapper: {
    marginBottom: "1.5rem",
    marginTop: "1.5rem"
  },
  switchLabel: {
    fontSize: "1rem",
    lineHeight: "1.6rem",
    fontWeight: 400,
    color: theme.palette.text.secondary
  },
  buttonGroup: {
    marginTop: "3.5rem"
  },
  buttonStyles: {
    width: "8.8125rem",
    marginTop: "-1rem"
  },
  saveButtonStyles: {
    width: "14.6875rem",
    marginTop: "-1rem"
  }
});

export default styles;
