import { Typography } from "@mui/material";
import { DateTime } from "luxon";
import { type NextPage } from "next";

import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getCurrentAndNextYear } from "~community/common/utils/dateTimeUtils";
import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import LeaveRequests from "~community/leave/components/molecules/LeaveRequests/LeaveRequests";
import EmployeeLeaveStatusPopupController from "~community/leave/components/organisms/EmployeeLeaveStatusPopupController/EmployeeLeaveStatusPopupController";
import { useLeaveStore } from "~community/leave/store/store";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const MyRequests: NextPage = () => {
  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveAllocation"
  );

  const { selectedYear, setSelectedYear } = useLeaveStore((state) => state);

  const now = DateTime.now();
  const nextYear = now.plus({ years: 1 }).year;
  const { data: isEntitlementAvailableNextYear } = useGetLeaveAllocation(
    nextYear.toString()
  );

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_PAGE_VIEWED,
    triggerOnMount: true
  });

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
      customRightContent={
        isEntitlementAvailableNextYear &&
        isEntitlementAvailableNextYear.length !== 0 ? (
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
        <LeaveAllocation />
        <LeaveRequests />
        <EmployeeLeaveStatusPopupController />
      </>
    </ContentLayout>
  );
};

export default MyRequests;
