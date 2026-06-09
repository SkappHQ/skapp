import { useCrmStore } from "~community/crm/store/store";

import ContactSidePanel from "./ContactSidePanel";

const ContactSidePanelController = () => {
  const {
    isContactSidePanelOpen,
    selectedContact,
    setIsContactSidePanelOpen,
    setSelectedContact
  } = useCrmStore((store) => ({
    isContactSidePanelOpen: store.isContactSidePanelOpen,
    selectedContact: store.selectedContact,
    setIsContactSidePanelOpen: store.setIsContactSidePanelOpen,
    setSelectedContact: store.setSelectedContact
  }));

  const handleClose = (): void => {
    setIsContactSidePanelOpen(false);
    setSelectedContact(null);
  };

  return (
    <ContactSidePanel
      contact={selectedContact}
      isOpen={isContactSidePanelOpen}
      onClose={handleClose}
    />
  );
};

export default ContactSidePanelController;
