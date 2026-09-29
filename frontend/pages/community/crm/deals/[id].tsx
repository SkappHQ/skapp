import { NextPage } from "next";

import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import DealDetailPage from "~community/crm/v2/components/templates/DealDetailPage/DealDetailPage";

const DealDetail: NextPage = () => (
  <>
    <DealDetailPage />
    <TaskModalControllerV2 />
  </>
);

export default DealDetail;
