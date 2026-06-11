import { SidePanel } from "@rootcodelabs/skapp-ui";
import React, { FC } from "react";

interface ContactSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactSidePanel: FC<ContactSidePanelProps> = ({ isOpen, onClose }) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default ContactSidePanel;
