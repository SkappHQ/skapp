import { FC, ReactNode, useEffect } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";

interface SidePanelWrapperProps {
  children: ReactNode;
  isOpen?: boolean;
}

const SidePanelWrapper: FC<SidePanelWrapperProps> = ({
  children,
  isOpen = true
}) => {
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
