import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import styles from "./styles";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    setIsCompanyModalOpen,
    setCompanyModalType,
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedCompany,
    selectedCompany
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setCompanyModalType: store.setCompanyModalType,
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedCompany: store.setSelectedCompany,
    selectedCompany: store.selectedCompany
  }));

  const handleCloseSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedCompany(null);
  };

  const onPrimaryButtonClick = () => {
    setIsCompanyModalOpen(true);
    setCompanyModalType(CrmModalTypes.ADD_COMPANY_MODAL);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addCompanyBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <>
        {selectedCompany && (
          <div style={styles.sidePanelWrapper}>
            <CompanySidePanel
              isOpen={isCrmSidePanelOpen}
              onClose={handleCloseSidePanel}
            />
          </div>
        )}
        <CompanyModalController />
        <CompanyTable />
      </>
    </ContentLayout>
  );
};

export default Companies;
