import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
import {
  CrmModalTypes,
  CrmSidePanelTypes
} from "~community/crm/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const router = useRouter();

  const {
    setIsCompanyModalOpen,
    setCompanyModalType,
    selectedCompanyId,
    setSelectedCompanyId,
    openCrmSidePanel
  } = useCrmStore(
    useShallow((store) => ({
      setIsCompanyModalOpen: store.setIsCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType,
      selectedCompanyId: store.selectedCompanyId,
      setSelectedCompanyId: store.setSelectedCompanyId,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  useInitializeCrmData();

  useEffect(() => {
    if (!router.isReady || !router.query.companyId) return;

    setSelectedCompanyId(Number(router.query.companyId));
    openCrmSidePanel(CrmSidePanelTypes.COMPANY_SIDE_PANEL);
  }, [router.isReady, router.query.companyId]);

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
