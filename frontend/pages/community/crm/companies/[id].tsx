import { NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";

const CrmCompanyDetails: NextPage = () => {
  const translateText = useTranslator("crmModule", "companies");
  const { id } = useRouter().query;

  return (
    <ContentLayout
      pageHead={translateText(["detailsPageHead"])}
      title={translateText(["detailsTitle"])}
    >
      {/* Company details for id: {id} */}
    </ContentLayout>
  );
};

export default CrmCompanyDetails;
