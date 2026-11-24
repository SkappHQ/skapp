import { NextPage } from "next";

import ActivitySidePanels from "~community/crm/activities/components/organisms/ActivitySidePanels/ActivitySidePanels";
import RecordActivityModalController from "~community/crm/components/organisms/RecordActivityModalController/RecordActivityModalController";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import DealDetailPage from "~community/crm/components/templates/DealDetailPage/DealDetailPage";

const DealDetail: NextPage = () => (
  <>
    <DealDetailPage />
    <TaskModalController />
    <RecordActivityModalController />
    <ActivitySidePanels />
  </>
);

export default DealDetail;
