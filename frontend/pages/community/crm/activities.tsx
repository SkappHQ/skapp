import { NextPage } from "next";
import { useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import ActivitiesContent from "~community/crm/activities/components/organisms/ActivitiesContent/ActivitiesContent";
import LogCallModal from "~community/crm/components/molecules/LogCallModal/LogCallModal";

const Activities: NextPage = () => {
  const translateText = useTranslator("crmModule");

  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["breadcrumbs", "activities"]) }
      ]}
      pageHead={translateText(["activities", "page", "pageHead"])}
      title={translateText(["activities", "page", "title"])}
      primaryButtonText={translateText(["activities", "page", "logCallBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() => setIsLogCallModalOpen(true)}
      module={Modules.CRM}
    >
      <>
        <LogCallModal
          isOpen={isLogCallModalOpen}
          onClose={() => setIsLogCallModalOpen(false)}
        />
        <ActivitiesContent />
      </>
    </ContentLayout>
  );
};

export default Activities;
