import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isTitleHidden
    >
      <DealsSection />
    </ContentLayout>
  );
};

export default Deals;
