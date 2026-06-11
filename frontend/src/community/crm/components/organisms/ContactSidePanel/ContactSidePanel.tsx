import { SidePanel } from "@rootcodelabs/skapp-ui";

import { useCrmStore } from "~community/crm/store/store";

const ContactSidePanel = () => {
  const {
    isContactSidePanelOpen,
    setIsContactSidePanelOpen,
    setSelectedContact
  } = useCrmStore((store) => ({
    isContactSidePanelOpen: store.isContactSidePanelOpen,
    setIsContactSidePanelOpen: store.setIsContactSidePanelOpen,
    setSelectedContact: store.setSelectedContact
  }));

  const handleClose = (): void => {
    setIsContactSidePanelOpen(false);
    setSelectedContact(null);
  };

  return <SidePanel isOpen={isContactSidePanelOpen} onClose={handleClose} />;
};

export default ContactSidePanel;
