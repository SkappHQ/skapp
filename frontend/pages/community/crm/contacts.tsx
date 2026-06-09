import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { IconName } from "~community/common/types/IconTypes";
import { ContactTable } from "~community/crm/components/organisms/ContactTable/ContactTable";

const Contacts: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addContactBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <ContactTable />
    </ContentLayout>
  );
};

export default Contacts;
