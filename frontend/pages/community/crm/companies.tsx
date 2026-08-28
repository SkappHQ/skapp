import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

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
import CompanyModalControllerV2 from "~community/crm/v2/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanelV2 from "~community/crm/v2/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable as CompanyTableV2 } from "~community/crm/v2/components/organisms/CompanyTable/CompanyTable";
import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapperV2 from "~community/crm/v2/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes as CrmModalTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

// Flip to true to serve the CRM Companies page from the normalized v2 store surface.
const isCrmCompaniesV2 = false;

const CompaniesV1 = () => {
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
  );
};

const CompaniesV2 = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsCompanyModalOpen, setCompanyModalType, selectedCompanyId } =
    useCrmStoreV2(
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
      setCompanyModalType(CrmModalTypesV2.ADD_COMPANY_MODAL);
    });
  };

  return (
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
          <SidePanelWrapperV2>
            <CompanySidePanelV2 companyId={selectedCompanyId} />
          </SidePanelWrapperV2>
        )}

        <CompanyModalControllerV2 />
        <TaskModalControllerV2 />
        <CompanyTableV2 />
      </>
    </ContentLayout>
  );
};

const Companies: NextPage = () =>
  isCrmCompaniesV2 ? <CompaniesV2 /> : <CompaniesV1 />;

export default Companies;
