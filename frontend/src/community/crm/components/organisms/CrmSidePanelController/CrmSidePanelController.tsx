import CompanyViewSidePanel from "~community/crm/components/templates/CompanyViewSidePanel/CompanyViewSidePanel";
import { useCrmStore } from "~community/crm/store/store";

/**
 * Renders all CRM side panels at page level, driven by crmStore.
 * Add future side panels (company, deal, etc.) here.
 */
const CrmSidePanelController = () => {
  const {
    isCompanyDetailDrawerOpen,
    setIsCompanyDetailDrawerOpen,
    selectedCompany
  } = useCrmStore((state) => state);

  return (
    <CompanyViewSidePanel
      isOpen={isCompanyDetailDrawerOpen}
      onClose={() => setIsCompanyDetailDrawerOpen(false)}
      selectedCompany={selectedCompany}
    />
  );
};

export default CrmSidePanelController;
