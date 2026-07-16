import { FC, ReactNode, useEffect } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface Props {
  children: ReactNode;
  isOpen?: boolean;
}

const SidePanelWrapper: FC<Props> = ({ children, isOpen = true }) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return <div style={{ zIndex: ZIndexEnums.CRM_SIDE_PANEL }}>{children}</div>;
};

export default SidePanelWrapper;
