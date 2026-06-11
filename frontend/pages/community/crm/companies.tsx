import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { IconName } from "~community/common/types/IconTypes";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");

  const {
    setIsCompanyModalOpen,
    setCompanyModalType,
    isCompanySidePanelOpen,
    setIsCompanySidePanelOpen,
    setSelectedCompany
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setCompanyModalType: store.setCompanyModalType,
    isCompanySidePanelOpen: store.isCompanySidePanelOpen,
    setIsCompanySidePanelOpen: store.setIsCompanySidePanelOpen,
    setSelectedCompany: store.setSelectedCompany
  }));

  const handleCloseSidePanel = (): void => {
    setIsCompanySidePanelOpen(false);
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
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <>
        <CompanySidePanel
          isOpen={isCompanySidePanelOpen}
          onClose={handleCloseSidePanel}
        />
        <CompanyModalController />
        <CompanyTable />
      </>
    </ContentLayout>
  );
};

export default Companies;
