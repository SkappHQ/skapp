import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import ContactModalControllerV2 from "~community/crm/v2/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanelV2 from "~community/crm/v2/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable as ContactTableV2 } from "~community/crm/v2/components/organisms/ContactTable/ContactTable";
import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapperV2 from "~community/crm/v2/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes as CrmModalTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

// Flip to true to serve the CRM Contacts page from the normalized v2 store surface.
const isCrmContactsV2 = true;

const ContactsV1 = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

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

const ContactsV2 = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsContactModalOpen, setContactModalType, selectedContactId } =
    useCrmStoreV2(
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
      setContactModalType(CrmModalTypesV2.ADD_CONTACT_MODAL);
    });
  };

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
          <SidePanelWrapperV2>
            <ContactSidePanelV2 contactId={selectedContactId} />
          </SidePanelWrapperV2>
        )}

        <ContactModalControllerV2 />
        <TaskModalControllerV2 />
        <ContactTableV2 initializeCrmData={isCrmInitialDataLoading} />
      </>
    </ContentLayout>
  );
};

const Contacts: NextPage = () =>
  isCrmContactsV2 ? <ContactsV2 /> : <ContactsV1 />;

export default Contacts;
