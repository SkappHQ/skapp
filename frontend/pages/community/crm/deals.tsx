import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ position: "relative", zIndex: 1200 }}
    >
      <DealsSection />
    </ContentLayout>
  );
};

export default Deals;
