import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import CrmContactsModalController from "~community/crm/components/organisms/CrmContactsModalController/CrmContactsModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

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
        <CrmContactsModalController />
      </>
    </ContentLayout>
  );
};

export default Contacts;
