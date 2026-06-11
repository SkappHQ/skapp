import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactSidePanel from "~community/crm/components/organisms/ContactSidePanel/ContactSidePanel";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import { useCrmStore } from "~community/crm/store/store";

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

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <>
        <ContactSidePanel
          isOpen={isContactSidePanelOpen}
          onClose={handleCloseSidePanel}
        />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
