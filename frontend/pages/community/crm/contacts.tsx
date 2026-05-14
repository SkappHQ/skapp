import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ContactDetailPanel from "~community/crm/components/organisms/ContactDetailPanel/ContactDetailPanel";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

  return (
    <>
      <ContentLayout
        pageHead={translateText(["pageHead"])}
        title={translateText(["title"])}
        primaryButtonText={translateText(["addContactBtn"])}
        primaryBtnIconName={IconName.ADD_ICON}
      >
        {/*
         * TODO: Wire up the contacts table/list here.
         * 1. Open the side panel on row click:
         *      const { openContactDetailPanel, selectedContactId } = useCrmStore();
         *      // In the row's onClick: openContactDetailPanel(contact.id)
         *
         * 2. Highlight the selected row:
         *      selected={selectedContactId === contact.id}
         */}
      </ContentLayout>
      <ContactDetailPanel />
    </>
  );
};

export default Contacts;
