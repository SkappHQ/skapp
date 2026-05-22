import { type NextPage } from "next";
import { useRouter } from "next/router";

import ClockInData from "~community/common/components/organisms/ClockInData/ClockInData";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import { useTranslator } from "~community/common/hooks/useTranslator";

const LateArrivalsSummary: NextPage = () => {
  useBreadcrumbs([
    {
      label: "dashboard",
      href: ROUTES.DASHBOARD.BASE
    },
    {
      label: "attendance"
    },
    {
      label: "lateArrivalsTableSummary"
    }
  ]);
  const translateText = useTranslator("attendanceModule", "dashboards");
  const router = useRouter();

  return (
    <ContentLayout
      pageHead={translateText(["attendanceDashboard.lateArrivalsTableSummary"])}
      title={translateText(["attendanceDashboard.lateArrivalsTableSummary"])}
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

export default LateArrivalsSummary;
