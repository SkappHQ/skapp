const styles = () => ({
  leftArrowStyles: (visibilityStatus: string) => ({
    position: "absolute",
    bottom: "1.8rem",
    left: "6%",
    cursor: "pointer",
    visibility: visibilityStatus
  }),
  rightArrowStyles: (visibilityStatus: string) => ({
    position: "absolute",
    bottom: "1.8rem",
    right: "2.5%",
    cursor: "pointer",
    visibility: visibilityStatus
  })
});

export default styles;
