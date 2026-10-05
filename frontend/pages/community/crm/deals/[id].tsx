import { NextPage } from "next";

import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import DealDetailPage from "~community/crm/components/templates/DealDetailPage/DealDetailPage";

const DealDetail: NextPage = () => (
  <>
    <DealDetailPage />
    <TaskModalController />
  </>
);

export default DealDetail;
