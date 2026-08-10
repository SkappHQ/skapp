import { Typography } from "@mui/material";
import { DateTime } from "luxon";
import { type NextPage } from "next";

import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getCurrentAndNextYear } from "~community/common/utils/dateTimeUtils";
import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import { useGetMyPolicyBalances } from "~community/leave/api/PolicyLeaveApi";
import EmployeeLeaveStatusPopupController from "~community/leave/components/organisms/EmployeeLeaveStatusPopupController/EmployeeLeaveStatusPopupController";
import MyLeaveAllocationSection from "~community/leave/components/organisms/MyLeaveAllocationSection/MyLeaveAllocationSection";
import MyLeaveRequestsSection from "~community/leave/components/organisms/MyLeaveRequestsSection/MyLeaveRequestsSection";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { useLeaveStore } from "~community/leave/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const MyRequests: NextPage = () => {
  const translateText = useTranslator("leaveModule");
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveAllocation"
  );

  const { selectedYear, setSelectedYear } = useLeaveStore((state) => state);

  const now = DateTime.now();
  const nextYear = now.plus({ years: 1 }).year;

  const { isLeavePoliciesEnabled, isLoading: isLeavePolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const { data: isEntitlementAvailableNextYear } = useGetLeaveAllocation(
    nextYear.toString(),
    !isLeavePolicyConfigLoading && !isLeavePoliciesEnabled
  );

  const { data: nextYearPolicyBalances } = useGetMyPolicyBalances(
    nextYear.toString(),
    isLeavePoliciesEnabled
  );

  const isNextYearAvailable = isLeavePoliciesEnabled
    ? (nextYearPolicyBalances?.length ?? 0) > 0
    : (isEntitlementAvailableNextYear?.length ?? 0) > 0;

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_PAGE_VIEWED,
    triggerOnMount: true
  });

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["analytics.stepLeave"])
        },
        {
          label: translateText(["myRequests.title"])
        }
      ]}
      pageHead={translateText(["myRequests.pageHead"])}
      title={translateText(["myRequests.title"])}
      isDividerVisible={true}
      customRightContent={
        isNextYearAvailable ? (
          <RoundedSelect
            id="leave-allocations-year-dropdown"
            value={selectedYear}
            options={getCurrentAndNextYear()}
            onChange={(event) => setSelectedYear(event?.target.value)}
            renderValue={(selectedValue: string) => {
              return (
                <Typography
                  aria-label={`${translateAria(["currentSelection"])} ${selectedValue}`}
                >
                  {selectedValue}
                </Typography>
              );
            }}
            accessibility={{
              label: translateAria(["selectYear"])
            }}
          />
        ) : (
          <></>
        )
      }
    >
      <>
        <MyLeaveAllocationSection />
        <MyLeaveRequestsSection />
        <EmployeeLeaveStatusPopupController />
      </>
    </ContentLayout>
  );
};

export default MyRequests;
