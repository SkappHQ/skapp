import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactModalController from "~community/crm/components/organisms/ContactModalController/ContactModalController";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

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
    >
      <>
        <ContactModalController />
        <ContactTable />
      </>
    </ContentLayout>
  );
};

export default Contacts;
