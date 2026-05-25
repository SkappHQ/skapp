import { Box } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import PendingLeaveRequestTable from "~community/leave/components/molecules/PendingLeaveRequestTable/PendingLeaveRequestTable";

const PendingLeave: NextPage = () => {
  const translateText = useTranslator("leaveModule", "pendingRequests");

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const router = useRouter();

  return (
    <ContentLayout
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
        <PendingLeaveRequestTable searchTerm={searchTerm} />
      </>
    </ContentLayout>
  );
};

export default PendingLeave;
