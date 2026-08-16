import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmDataProvider } from "~community/crm/v2/providers/CrmDataProvider";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsCompanyModalOpen, setCompanyModalType, selectedCompanyId } =
    useCrmStore((store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType,
      selectedCompanyId: store.selectedCompanyId
    }));

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.COMPANIES, () => {
      setIsCompanyModalOpen(true);
      setCompanyModalType(CrmModalTypes.ADD_COMPANY_MODAL);
    });
  };

  return (
    <CrmDataProvider>
      <ContentLayout
        breadcrumbs={[
          { label: translateText(["breadcrumbs", "crm"]) },
          { label: translateText(["companies", "title"]) }
        ]}
        pageHead={translateText(["companies", "pageHead"])}
        title={translateText(["companies", "title"])}
        primaryButtonText={translateText(["companies", "addCompanyBtn"])}
        primaryBtnIconName={IconName.ADD_ICON}
        onPrimaryButtonClick={onPrimaryButtonClick}
        isPrimaryBtnLoading={isCheckingCrmLimit}
        module={Modules.CRM}
      >
        <>
          {selectedCompanyId && (
            <SidePanelWrapper>
              <CompanySidePanel />
            </SidePanelWrapper>
          )}

          <CompanyModalController />
          <TaskModalController />
          <CompanyTable />
        </>
      </ContentLayout>
    </CrmDataProvider>
  );
};

export default Companies;
