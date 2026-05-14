import ContactViewSidePanel from "~community/crm/components/organisms/ContactViewSidePanel/ContactViewSidePanel";
import { useCrmStore } from "~community/crm/store/store";

/**
 * Renders all CRM side panels at page level, driven by crmStore.
 * Add future side panels (company, deal, etc.) here.
 */
const CrmSidePanelController = () => {
  const {
    isContactSidePanelOpen,
    selectedContactForPanel,
    closeContactSidePanel
  } = useCrmStore((state) => state);

  return (
    <ContactViewSidePanel
      contact={selectedContactForPanel}
      isOpen={isContactSidePanelOpen}
      onClose={closeContactSidePanel}
    />
  );
};

export default CrmSidePanelController;
