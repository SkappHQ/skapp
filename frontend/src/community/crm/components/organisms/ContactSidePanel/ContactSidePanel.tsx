import { SidePanel, SidePanelProps } from "@rootcodelabs/skapp-ui";

const ContactSidePanel = ({ isOpen, onClose }: SidePanelProps) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default ContactSidePanel;
