import { Box } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import NotificationReadProvider from "~community/common/providers/NotificationReadProvider";
import { NotificationSummaryType } from "~community/common/types/notificationTypes";
import PendingLeaveRequestsSection from "~community/leave/components/organisms/PendingLeaveRequestsSection/PendingLeaveRequestsSection";

const PendingLeave: NextPage = () => {
  const translateText = useTranslator("leaveModule", "pendingRequests");
  const translateBreadcrumbText = useTranslator("leaveModule");

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const router = useRouter();

  return (
    <NotificationReadProvider
      notificationType={NotificationSummaryType.LEAVE_REQUEST}
    >
      <ContentLayout
        breadcrumbs={[
          {
            label: translateBreadcrumbText(["analytics.stepLeave"])
          },
          {
            label: translateBreadcrumbText(["leaveRequests.title"])
          }
        ]}
        pageHead={translateText(["pageHead"])}
        title={translateText(["title"])}
        isDividerVisible={true}
        isBackButtonVisible={true}
        onBackClick={() => router.replace(ROUTES.DASHBOARD.BASE)}
      >
        <>
          <Box mb={2}>
            <SearchBox
              value={searchTerm}
              setSearchTerm={setSearchTerm}
              placeHolder={translateText(["searchBoxPlaceholder"])}
            />
          </Box>
          <PendingLeaveRequestsSection searchTerm={searchTerm} />
        </>
      </ContentLayout>
    </NotificationReadProvider>
  );
};

export default PendingLeave;
