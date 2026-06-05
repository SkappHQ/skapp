import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import TasksTable from "~community/crm/components/organisms/TasksTable/TasksTable";

const Tasks: NextPage = () => {
  const translateText = useTranslator("crmModule", "tasks");

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addTaskBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
    >
      <TasksTable />
    </ContentLayout>
  );
};

export default Tasks;
