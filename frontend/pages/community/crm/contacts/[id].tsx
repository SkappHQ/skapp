import { NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";

const CrmContactDetails: NextPage = () => {
  const translateText = useTranslator("crmModule", "contacts");
  const { id } = useRouter().query;

  return (
    <ContentLayout
      pageHead={translateText(["detailsPageHead"])}
      title={translateText(["detailsTitle"])}
    >
      {/* Contact details for id: {id} */}
    </ContentLayout>
  );
};

export default CrmContactDetails;
