import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { CRM_CONTAINER_STYLES } from "~community/crm/constants/styleConstants";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={CRM_CONTAINER_STYLES}
    >
      <DealsSection />
    </ContentLayout>
  );
};

export default Deals;
