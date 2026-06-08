import { useCrmStore } from "~community/crm/store/store";

import CompanySidePanel from "../CompanySidePanel/CompanySidePanel";

const CompanySidePanelController = () => {
  const {
    isCompanySidePanelOpen,
    selectedCompany,
    setIsCompanySidePanelOpen,
    setSelectedCompany
  } = useCrmStore((store) => ({
    isCompanySidePanelOpen: store.isCompanySidePanelOpen,
    selectedCompany: store.selectedCompany,
    setIsCompanySidePanelOpen: store.setIsCompanySidePanelOpen,
    setSelectedCompany: store.setSelectedCompany
  }));

  const handleClose = (): void => {
    setIsCompanySidePanelOpen(false);
    setSelectedCompany(null);
  };

  return (
    <CompanySidePanel
      company={selectedCompany}
      isOpen={isCompanySidePanelOpen}
      onClose={handleClose}
    />
  );
};

export default CompanySidePanelController;
