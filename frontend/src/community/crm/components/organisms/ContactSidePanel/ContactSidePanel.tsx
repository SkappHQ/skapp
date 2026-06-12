import { SidePanel, SidePanelProps } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

const ContactSidePanel: FC<SidePanelProps> = ({ isOpen, onClose }) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default ContactSidePanel;
