import { NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";

const CrmDealDetails: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");
  const { id } = useRouter().query;

  return (
    <ContentLayout
      pageHead={translateText(["detailsPageHead"])}
      title={translateText(["detailsTitle"])}
    >
      {/* Deal details for id: {id} */}
    </ContentLayout>
  );
};

export default CrmDealDetails;
