import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { IconName } from "~community/common/types/IconTypes";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <></>
    </ContentLayout>
  );
};

export default Tasks;
