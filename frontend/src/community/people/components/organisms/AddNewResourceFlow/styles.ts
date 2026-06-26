import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  stepperWrapper: {
    padding: { xs: "0.8rem 0rem", lg: "1.5rem 0rem" }
  },
  stepper: {
    width: { lg: "100%", xl: "70%" }
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: ZIndexEnums.MODAL
  }
});

export default styles;
