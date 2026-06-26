const styles = () => ({
  wrapper: {
    height: "auto",
    width: "100%",
    maxHeight: "25rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "stretch",
    alignItems: "start",
    overflowY: "auto"
  },
  columnOne: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  columnTwo: {
    display: "flex",
    flex: 1,
    width: "100%",
    justifyContent: "stretch",
    alignItems: "start"
  },
  avatarWrapper: { mt: "0.75rem" },
  title: { fontWeight: "700" },
  basicChipWrapper: { height: "auto", m: 2, cursor: "pointer" },
  basicChip: { backgroundColor: "grey.100", padding: "0.75rem 1rem" },
  avatarChipWrapper: { py: "0.625rem", maxWidth: "13rem" },
  avatarChip: { backgroundColor: "grey.100", justifyContent: "left" }
});

export default styles;
