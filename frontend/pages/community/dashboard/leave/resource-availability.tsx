import { type NextPage } from "next";
import { useRouter } from "next/router";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ResourceAvailabilityCalendar from "~community/leave/components/organisms/LeaveDashboard/ResourceAvailability";
import LeaveManagerModalController from "~community/leave/components/organisms/LeaveManagerModalController/LeaveManagerModalController";

const ResourceAvailability: NextPage = () => {
  const translateText = useTranslator("leaveModule", "dashboard");
  const router = useRouter();

  return (
    <ContentLayout
      pageHead={translateText(["resourceAvailability"])}
      title={translateText(["resourceAvailability"])}
      isDividerVisible={false}
      isBackButtonVisible={true}
      onBackClick={() => router.replace(ROUTES.DASHBOARD.BASE)}
    >
      <>
        <ResourceAvailabilityCalendar />
        <LeaveManagerModalController />
      </>
    </ContentLayout>
  );
};

export default ResourceAvailability;
