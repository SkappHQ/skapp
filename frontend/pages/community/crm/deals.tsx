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
    >
      {/*Add z index to  the sidpanel wrapper here once side panel is implemented.*/}
      <DealsSection />
    </ContentLayout>
  );
};

export default Deals;
