import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsCompanyModalOpen, setCompanyModalType, selectedCompanyId } =
    useCrmStore(
      useShallow((store) => ({
        setIsCompanyModalOpen: store.setIsCompanyModalOpen,
        setCompanyModalType: store.setCompanyModalType,
        selectedCompanyId: store.selectedCompanyId
      }))
    );

  useInitializeCrmData();

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.COMPANIES, () => {
      setIsCompanyModalOpen(true);
      setCompanyModalType(CrmModalTypes.ADD_COMPANY_MODAL);
    });
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["companies", "page", "title"]) }
      ]}
      pageHead={translateText(["companies", "page", "pageHead"])}
      title={translateText(["companies", "page", "title"])}
      primaryButtonText={translateText(["companies", "page", "addCompanyBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
    >
      <>
        {selectedCompanyId && (
          <SidePanelWrapper>
            <CompanySidePanel companyId={selectedCompanyId} />
          </SidePanelWrapper>
        )}

        <CompanyModalController />
        <TaskModalController />
        <CompanyTable />
      </>
    </ContentLayout>
  );
};

export default Companies;
