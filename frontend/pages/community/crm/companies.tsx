import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import CompanyModalController from "~community/crm/components/organisms/CompanyModalController/CompanyModalController";
import CompanySidePanel from "~community/crm/components/organisms/CompanySidePanel/CompanySidePanel";
import { CompanyTable } from "~community/crm/components/organisms/CompanyTable/CompanyTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { useCrmSession } from "~community/crm/v2/hooks/useCrmSession";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Companies: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setToastMessage } = useToast();
  const { isError: isCrmSessionError } = useCrmSession();

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

  const crmSessionErrorTitle = translateText([
    "common",
    "initData",
    "errorTitle"
  ]);
  const crmSessionErrorDescription = translateText([
    "common",
    "initData",
    "errorDescription"
  ]);

  useEffect(() => {
    if (!isCrmSessionError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: crmSessionErrorTitle,
      description: crmSessionErrorDescription
    });
  }, [
    isCrmSessionError,
    crmSessionErrorTitle,
    crmSessionErrorDescription,
    setToastMessage
  ]);

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

export default Companies;
