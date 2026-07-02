import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const {
    setIsCompanyModalOpen,
    setCompanyModalType,
    isCrmSidePanelOpen,
    crmSidePanelType,
    closeCrmSidePanel,
    setSelectedCompany,
    selectedCompany
  } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen,
    setCompanyModalType: store.setCompanyModalType,
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    crmSidePanelType: store.crmSidePanelType,
    closeCrmSidePanel: store.closeCrmSidePanel,
    setSelectedCompany: store.setSelectedCompany,
    selectedCompany: store.selectedCompany
  }));

  const handleCloseSidePanel = () => {
    closeCrmSidePanel();
    setSelectedCompany(null);
  };

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.COMPANIES, () => {
      setIsCompanyModalOpen(true);
      setCompanyModalType(CrmModalTypes.ADD_COMPANY_MODAL);
    });
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addCompanyBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
    >
      <>
        {selectedCompany && (
          <SidePanelWrapper>
            <CompanySidePanel
              isOpen={
                isCrmSidePanelOpen &&
                crmSidePanelType === CrmSidePanelTypes.COMPANY_SIDE_PANEL
              }
              onClose={handleCloseSidePanel}
            />
            <AddDealSidePanel />
          </SidePanelWrapper>
        )}

        <CompanyModalController />
        <CompanyTable />
      </>
    </ContentLayout>
  );
};

export default Companies;
