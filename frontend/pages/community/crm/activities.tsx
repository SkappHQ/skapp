import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivitiesContent from "~community/crm/activities/components/organisms/ActivitiesContent/ActivitiesContent";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";

const Activities: NextPage = () => {
  const translateText = useTranslator("crmModule");

  useInitializeCrmData();

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["breadcrumbs", "activities"]) }
      ]}
      pageHead={translateText(["activities", "page", "pageHead"])}
      title={translateText(["activities", "page", "title"])}
      containerStyles={{
        padding: { xs: "1.375rem 2rem 0", lg: "1.375rem 3rem 0" }
      }}
      module={Modules.CRM}
    >
      <ActivitiesContent />
    </ContentLayout>
  );
};

export default Activities;
