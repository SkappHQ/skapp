const styles = () => ({
  protectedWrapper: {
    flexDirection: "row",
    width: "100%",
    overflowX: "clip"
  },
  contentWrapper: {
    width: "100%",
    minWidth: 0, // In a flex row, flex items have min-width: auto by default,when it 0 flex item can shrink,
    height: "100%",
    boxSizing: "border-box",
    transition: "width 0.3s ease"
  }
});

export default styles;
