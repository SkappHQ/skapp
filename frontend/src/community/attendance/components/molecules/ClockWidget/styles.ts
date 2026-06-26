import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles = () => ({
  timerContainer: (isDisabled: boolean) => ({
    opacity: isDisabled ? 0.5 : 1,
    pointerEvents: "auto",
    filter: isDisabled ? "grayscale(100%)" : "none",
    zIndex: ZIndexEnums.DEFAULT,
    width: "fit-content"
  })
});

export default styles;
