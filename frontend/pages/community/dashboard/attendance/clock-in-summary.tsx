import { type NextPage } from "next";
import { useRouter } from "next/router";

import ClockInData from "~community/common/components/organisms/ClockInData/ClockInData";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";

const ClockInSummary: NextPage = () => {
  const translateText = useTranslator("attendanceModule", "dashboards");
  const router = useRouter();

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboard"]),
          href: ROUTES.DASHBOARD.BASE
        },
        {
          label: translateText(["attendanceDashboard.attendance"])
        },
        {
          label: translateText([
            "attendanceDashboard.clockInTableSummary.title"
          ])
        }
      ]}
      pageHead={translateText([
        "attendanceDashboard.clockInTableSummary.title"
      ])}
      title={translateText(["attendanceDashboard.clockInTableSummary.title"])}
      isDividerVisible={true}
      isBackButtonVisible={true}
      onBackClick={() => router.replace(ROUTES.DASHBOARD.BASE)}
    >
      <>
        <ClockInData />
      </>
    </ContentLayout>
  );
};

export default ClockInSummary;
