import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { useCrmSession } from "~community/crm/v2/hooks/useCrmSession";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setToastMessage } = useToast();
  const { isError: isCrmSessionError } = useCrmSession();

  const { setIsContactModalOpen, setContactModalType, selectedContactId } =
    useCrmStore((store) => ({
      setIsContactModalOpen: store.setIsContactModalOpen,
      setContactModalType: store.setContactModalType,
      selectedContactId: store.selectedContactId
    }));

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.CONTACTS, () => {
      setIsContactModalOpen(true);
      setContactModalType(CrmModalTypes.ADD_CONTACT_MODAL);
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
        { label: translateText(["contacts", "title"]) }
      ]}
      pageHead={translateText(["contacts", "pageHead"])}
      title={translateText(["contacts", "title"])}
      primaryButtonText={translateText(["contacts", "addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
    >
      <>
        {selectedContactId && (
          <SidePanelWrapper>
            <ContactSidePanel />
          </SidePanelWrapper>
        )}

        <ContactModalController />
        <TaskModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
