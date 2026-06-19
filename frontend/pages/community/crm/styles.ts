import { CSSProperties } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

const styles: Record<string, CSSProperties> = {
  sidePanelWrapper: {
    position: "relative",
    zIndex: ZIndexEnums.CRM_SIDE_PANEL
  }
};

export default styles;
