import ContactDetailPanel from "../ContactDetailPanel/ContactDetailPanel";

/**
 * Renders all CRM side panels at page level, driven by crmStore.
 * Add future side panels (company, deal, etc.) here.
 */
const CrmSidePanelController = () => {
  return <ContactDetailPanel />;
};

export default CrmSidePanelController;
