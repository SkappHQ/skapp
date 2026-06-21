import { FC, ReactNode } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface Props {
  children: ReactNode;
}

const SidePanelWrapper: FC<Props> = ({ children }) => {
  return <div style={{ zIndex: ZIndexEnums.CRM_SIDE_PANEL }}>{children}</div>;
};

export default SidePanelWrapper;
