"use client";

import { type NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useRouter from "~community/common/hooks/useCompatRouter";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ResourceAvailabilityCalendar from "~community/leave/components/organisms/LeaveDashboard/ResourceAvailability";
import LeaveManagerModalController from "~community/leave/components/organisms/LeaveManagerModalController/LeaveManagerModalController";

const ResourceAvailability: NextPage = () => {
  const translateText = useTranslator("leaveModule", "dashboard");
  const router = useRouter();

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboard"]),
          onClick: () => router.push(ROUTES.DASHBOARD.BASE)
        },
        {
          label: translateText(["leave"])
        },
        {
          label: translateText(["resourceAvailability"])
        }
      ]}
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
