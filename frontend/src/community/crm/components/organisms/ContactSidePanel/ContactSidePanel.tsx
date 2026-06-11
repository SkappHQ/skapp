import React from "react";
import { SidePanel } from "@rootcodelabs/skapp-ui";

interface ContactSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactSidePanel: React.FC<ContactSidePanelProps> = ({
  isOpen,
  onClose
}) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default ContactSidePanel;
