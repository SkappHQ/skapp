import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsContactModalOpen, setContactModalType, selectedContactId } =
    useCrmStore(
      useShallow((store) => ({
        setIsContactModalOpen: store.setIsContactModalOpen,
        setContactModalType: store.setContactModalType,
        selectedContactId: store.selectedContactId
      }))
    );

  const { isCrmInitialDataLoading } = useInitializeCrmData();

  const onPrimaryButtonClick = () => {
    guardCrmCreate(CrmLimitResource.CONTACTS, () => {
      setIsContactModalOpen(true);
      setContactModalType(CrmModalTypes.ADD_CONTACT_MODAL);
    });
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["contacts", "page", "title"]) }
      ]}
      pageHead={translateText(["contacts", "page", "pageHead"])}
      title={translateText(["contacts", "page", "title"])}
      primaryButtonText={translateText(["contacts", "page", "addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
      isPrimaryBtnLoading={isCheckingCrmLimit || isCrmInitialDataLoading}
      module={Modules.CRM}
    >
      <>
        {selectedContactId && (
          <SidePanelWrapper>
            <ContactSidePanel contactId={selectedContactId} />
          </SidePanelWrapper>
        )}

        <ContactModalController />
        <TaskModalController />
        <ContactTable isCrmDataLoading={isCrmInitialDataLoading} />
      </>
    </ContentLayout>
  );
};

export default Contacts;
