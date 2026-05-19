import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CrmContactsModalController from "~community/crm/components/organisms/CrmContactsModalController/CrmContactsModalController";
import CrmSidePanelController from "~community/crm/components/organisms/CrmSidePanelController/CrmSidePanelController";
import ContactsListView from "~community/crm/components/organisms/ContactsListView/ContactsListView";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import ContactDetailPanel from "~community/crm/components/organisms/ContactDetailPanel/ContactDetailPanel";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { setIsAddContactModalOpen, setCrmModalType } = useCrmStore(
    (state) => state
  );

  const handleAddContact = () => {
    setIsAddContactModalOpen(true);
    setCrmModalType(CrmModalTypes.ADD_CONTACT_MODAL);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      secondaryBtnText={translateText(["exportDataBtn"])}
      secondaryBtnIconName={IconName.FILE_UPLOAD_ICON}
      onPrimaryButtonClick={handleAddContact}
    >
      <>
        <ContactsListView />
        <CrmContactsModalController />
        <CrmSidePanelController />
      </>
    </ContentLayout>
  );
};

export default Contacts;
