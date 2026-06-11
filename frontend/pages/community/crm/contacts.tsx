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
    isContactSidePanelOpen,
    setIsContactSidePanelOpen,
    setSelectedContact
  } = useCrmStore((store) => ({
    isContactSidePanelOpen: store.isContactSidePanelOpen,
    setIsContactSidePanelOpen: store.setIsContactSidePanelOpen,
    setSelectedContact: store.setSelectedContact
  }));

  const handleCloseSidePanel = (): void => {
    setIsContactSidePanelOpen(false);
    setSelectedContact(null);
  };

  const { setIsAddContactModalOpen, setContactModalType } = useCrmStore(
    (store) => ({
      setIsAddContactModalOpen: store.setIsAddContactModalOpen,
      setContactModalType: store.setContactModalType
    })
  );

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
          isOpen={isContactSidePanelOpen}
          onClose={handleCloseSidePanel}
        />
        <ContactModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
