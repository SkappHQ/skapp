import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { CRM_CONTAINER_STYLES } from "~community/crm/constants/styleConstants";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={CRM_CONTAINER_STYLES}
    >
      <></>
    </ContentLayout>
  );
};

export default Tasks;
