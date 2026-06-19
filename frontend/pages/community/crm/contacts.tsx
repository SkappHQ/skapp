import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

import styles from "./styles";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedContact,
    setIsAddContactModalOpen,
    setContactModalType,
    selectedContact
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedContact: store.setSelectedContact,
    setIsAddContactModalOpen: store.setIsAddContactModalOpen,
    setContactModalType: store.setContactModalType,
    selectedContact: store.selectedContact
  }));

  const handleCloseSidePanel = () => {
    setIsCrmSidePanelOpen(false);
    setSelectedContact(null);
  };

  const onPrimaryButtonClick = () => {
    setIsAddContactModalOpen(true);
    setContactModalType(CrmModalTypes.ADD_CONTACT_MODAL);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={onPrimaryButtonClick}
    >
      <>
        {selectedContact && (
          <div style={styles.sidePanelWrapper}>
            <ContactSidePanel
              isOpen={isCrmSidePanelOpen}
              onClose={handleCloseSidePanel}
            />
          </div>
        )}

        <ContactModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
