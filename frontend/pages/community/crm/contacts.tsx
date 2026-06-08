import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";
import { CRM_CONTAINER_STYLES } from "~community/crm/constants/styleConstants";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={CRM_CONTAINER_STYLES}
    >
      <ContactTable />
    </ContentLayout>
  );
};

export default Contacts;
