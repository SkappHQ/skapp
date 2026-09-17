const styles = () => ({
  protectedWrapper: {
    flexDirection: "column",
    width: "100%",
    height: "100dvh",
    overflow: "hidden"
  },
  contentWrapper: {
    flexDirection: "column",
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    flex: 1,
    boxSizing: "border-box"
  },
  main: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minHeight: 0,
    overflowX: "clip",
    overflowY: "auto"
  },
  mainContent: {
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minHeight: 0,
    overflowX: "clip"
  },
  loader: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    position: "relative"
  }
});

export default styles;
