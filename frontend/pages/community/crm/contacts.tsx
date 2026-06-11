import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

  const {
    isCrmSidePanelOpen,
    setIsCrmSidePanelOpen,
    setSelectedContact,
    setIsAddContactModalOpen,
    setContactModalType
  } = useCrmStore((store) => ({
    isCrmSidePanelOpen: store.isCrmSidePanelOpen,
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedContact: store.setSelectedContact,
    setIsAddContactModalOpen: store.setIsAddContactModalOpen,
    setContactModalType: store.setContactModalType
  }));

  const handleCloseSidePanel = (): void => {
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
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <>
        <ContactSidePanel
          isOpen={isCrmSidePanelOpen}
          onClose={handleCloseSidePanel}
        />
        <ContactModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
