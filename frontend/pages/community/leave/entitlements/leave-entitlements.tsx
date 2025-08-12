import { Divider, Stack } from "@mui/material";
import { NextPage } from "next";
import { useEffect, useState } from "react";

import LeaveCarryForward from "~community/common/components/molecules/LeaveCarryForward/LeaveCarryForward";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetLeaveTypes } from "~community/leave/api/LeaveApi";
import { useGetLeaveEntitlements } from "~community/leave/api/LeaveEntitlementApi";
import LeaveEntitlementTable from "~community/leave/components/molecules/LeaveEntitlementTable/LeaveEntitlementTable";
import CustomLeaveAllocationContent from "~community/leave/components/organisms/CustomLeaveAllocationContent/CustomLeaveAllocationContent";
import LeaveEntitlementModalController from "~community/leave/components/organisms/LeaveEntitlementModalController/LeaveEntitlementModalController";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const LeaveEntitlements: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leaveEntitlements");

  const { data: leaveTypesList } = useGetLeaveTypes(false, true);

  const { setLeaveTypes } = useLeaveStore((state) => ({
    setLeaveTypes: state.setLeaveTypes
  }));

  const {
    page,
    leaveEntitlementTableSelectedYear,
    setLeaveEntitlementModalType
  } = useLeaveStore((state) => ({
    page: state.page,
    leaveEntitlementTableSelectedYear: state.leaveEntitlementTableSelectedYear,
    setLeaveEntitlementModalType: state.setLeaveEntitlementModalType
  }));

  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setLeaveTypes(leaveTypesList ?? []);
  }, [leaveTypesList, setLeaveTypes]);

  const { data: leaveEntitlementTableData, isFetching } =
    useGetLeaveEntitlements(
      leaveEntitlementTableSelectedYear,
      page,
      searchTerm
    );

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_LEAVE_ENTITLEMENT_PAGE_VISITED,
    triggerOnMount: true
  });

  return (
    <ContentLayout
      title={translateText(["title"])}
      pageHead={translateText(["pageHead"])}
      isDividerVisible
      primaryButtonType={ButtonStyle.SECONDARY}
      primaryButtonText={
        leaveEntitlementTableData &&
        leaveEntitlementTableData?.items.length > 0 &&
        translateText(["bulkUploadBtnTxt"])
      }
      primaryBtnIconName={IconName.UP_ARROW_ICON}
      onPrimaryButtonClick={() =>
        setLeaveEntitlementModalType(
          leaveEntitlementTableData?.items?.length === 0
            ? LeaveEntitlementModelTypes.DOWNLOAD_CSV
            : LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION
        )
      }
    >
      <>
        <Stack gap="1rem">
          {(searchTerm !== "" ||
            (leaveEntitlementTableData &&
              leaveEntitlementTableData?.items.length !== 0)) && (
            <SearchBox
              accessibility={{
                ariaHidden: false
              }}
              placeHolder={translateText(["searchBoxPlaceholder"])}
              value={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
          <LeaveEntitlementTable
            tableData={leaveEntitlementTableData}
            isFetching={isFetching}
            searchTerm={searchTerm}
          />
        </Stack>
        <Divider sx={{ my: "1.5rem" }} />
        <LeaveCarryForward />
        <Divider sx={{ my: "1.5rem" }} />
        <CustomLeaveAllocationContent />
        <LeaveEntitlementModalController />
      </>
    </ContentLayout>
  );
};

export default LeaveEntitlements;
