import { FC, ReactNode,useEffect } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface Props {
  children: ReactNode;
}

const SidePanelWrapper: FC<Props> = ({ children }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return <div style={{ zIndex: ZIndexEnums.CRM_SIDE_PANEL }}>{children}</div>;
};

export default SidePanelWrapper;
