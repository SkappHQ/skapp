import { Box } from "@mui/material";
import { type NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import NotificationReadProvider from "~community/common/providers/NotificationReadProvider";
import { NotificationSummaryType } from "~community/common/types/notificationTypes";
import AllLeaveRequestsSection from "~community/leave/components/organisms/AllLeaveRequestsSection/AllLeaveRequestsSection";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const LeaveRequests: NextPage = () => {
  const translateText = useTranslator("leaveModule");
  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_ALL_LEAVE_REQUEST_PAGE_VIEWED,
    triggerOnMount: true
  });

  return (
    <NotificationReadProvider
      notificationType={NotificationSummaryType.LEAVE_REQUEST}
    >
      <ContentLayout
        breadcrumbs={[
          {
            label: translateText(["analytics.stepLeave"])
          },
          {
            label: translateText(["leaveRequests.title"])
          }
        ]}
        pageHead={translateText(["leaveRequests.pageHead"])}
        title={translateText(["leaveRequests.title"])}
        isDividerVisible={true}
      >
        <Box
          role="region"
          aria-label={translateAria(["allLeaveRequestPage"])}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "100%"
          }}
        >
          <AllLeaveRequestsSection />
        </Box>
      </ContentLayout>
    </NotificationReadProvider>
  );
};

export default LeaveRequests;
