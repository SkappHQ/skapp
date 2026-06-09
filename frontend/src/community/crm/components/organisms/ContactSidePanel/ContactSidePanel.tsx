import { SidePanel } from "@rootcodelabs/skapp-ui";

import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";

const ContactSidePanel: React.FC<{
  contact: CrmContactMetricsType | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default ContactSidePanel;
