import { Typography } from "@mui/material";
import { DateTime } from "luxon";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

import AttendanceDashboard from "~community/attendance/components/organisms/AttendanceDashboard/AttendanceDashboard";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import TabsContainer from "~community/common/components/molecules/Tabs/Tabs";
import VersionUpgradeModal from "~community/common/components/molecules/VersionUpgradeModal/VersionUpgradeModal";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { OBOARDING_LOGOCOLORLOADER_DURATION } from "~community/common/constants/commonConstants";
import { CANCEL, SUCCESS } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import { ModuleTypes } from "~community/common/types/CommonTypes";
import { getCurrentAndNextYear } from "~community/common/utils/dateTimeUtils";
import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import LeaveAllocationSummary from "~community/leave/components/organisms/LeaveDashboard/LeaveAllocationSummary";
import LeaveDashboard from "~community/leave/components/organisms/LeaveDashboard/LeaveDashboard";
import LeaveManagerModalController from "~community/leave/components/organisms/LeaveManagerModalController/LeaveManagerModalController";
import { useLeaveStore } from "~community/leave/store/store";
import PeopleDashboard from "~community/people/components/organisms/PeopleDashboard/PeopleDashboard";
import APICTADashboard from "~enterprise/APICTA/dashboard";
import LogoColorLoader from "~enterprise/common/components/molecules/LogoColorLoader/LogoColorLoader";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";
import { tempShouldUseCustomDashboard } from "~enterprise/common/utils/commonUtil";

type RoleTypes = AdminTypes | ManagerTypes | EmployeeTypes;

const modulePermissions: Record<string, RoleTypes[]> = {
  TIME: [
    AdminTypes.SUPER_ADMIN,
    AdminTypes.ATTENDANCE_ADMIN,
    ManagerTypes.ATTENDANCE_MANAGER
  ],
  LEAVE: [
    AdminTypes.SUPER_ADMIN,
    AdminTypes.LEAVE_ADMIN,
    ManagerTypes.LEAVE_MANAGER
  ],
  PEOPLE: [
    AdminTypes.SUPER_ADMIN,
    AdminTypes.PEOPLE_ADMIN,
    ManagerTypes.PEOPLE_MANAGER
  ]
};

const LeaveYearSelector: FC<{
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}> = ({ selectedYear, setSelectedYear }) => {
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveAllocation"
  );

  return (
    <div className="flex mb-2">
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
    </div>
  );
};

const Dashboard: NextPage = () => {
  const { query } = useRouter();

  const queryMatches = useMediaQuery();
  const isBelow900 = queryMatches(MediaQueries.BELOW_900);

  const { setQuickSetupModalType } = useCommonEnterpriseStore((state) => ({
    setQuickSetupModalType: state.setQuickSetupModalType
  }));

  const billingTranslateText = useTranslator("settingEnterprise", "billing");

  const { setToastMessage } = useToast();

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (showLoader) {
      const timer = setTimeout(() => {
        setShowLoader(false);
        if (query.status === SUCCESS) {
          setToastMessage({
            toastType: ToastType.SUCCESS,
            title: billingTranslateText(["subscriptionSuccessToastTitle"]),
            description: billingTranslateText([
              "subscriptionSuccessToastDescription"
            ]),
            open: true
          });
        }
      }, OBOARDING_LOGOCOLORLOADER_DURATION);

      return () => clearTimeout(timer);
    }
  }, [billingTranslateText, setToastMessage, showLoader]);

  useEffect(() => {
    if (query.isFirstTime) {
      !isBelow900 &&
        setQuickSetupModalType(QuickSetupModalTypeEnums.START_QUICK_SETUP);
    }
    if (query.status === CANCEL) {
      setToastMessage({
        toastType: ToastType.ERROR,
        title: billingTranslateText(["subscriptionErrorToastTitle"]),
        description: billingTranslateText([
          "subscriptionErrorToastDescription"
        ]),
        open: true
      });
    }
  }, [query]);

  const translateText = useTranslator("dashboard");
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveAllocation"
  );
  const { data } = useSession();

  // Check if current tenant should use custom dashboard
  const tempUseCustomDashboard = tempShouldUseCustomDashboard(
    data?.user?.tenantId
  );

  // Permissions map for modules

  // Define tabs
  const tabs = [
    ...(data?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
      ? [
          {
            label: translateText(["attendanceTab"]),
            content: <AttendanceDashboard />,
            module: ModuleTypes.TIME
          }
        ]
      : []),
    ...(data?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
      ? [
          {
            label: translateText(["leaveTab"]),
            content: (
              <div>
                <LeaveDashboard />
              </div>
            ),
            module: ModuleTypes.LEAVE
          }
        ]
      : []),
    {
      label: translateText(["peopleTab"]),
      content: <PeopleDashboard />,
      module: ModuleTypes.PEOPLE
    }
  ];

  // Filters tabs based on user roles.
  const getVisibleTabs = (userRoles: RoleTypes[] = []) => {
    return tabs.filter((tab) => {
      const allowedRoles = modulePermissions[tab.module];
      return userRoles.some((role) => allowedRoles?.includes(role));
    });
  };

  const userRoles: RoleTypes[] = (data?.user?.roles || []) as RoleTypes[];
  const visibleTabs = getVisibleTabs(userRoles);
  const { selectedYear, setSelectedYear } = useLeaveStore((state) => state);

  const currentDate = DateTime.now();
  const nextYear = currentDate.plus({ years: 1 }).year;
  const { data: isEntitlementAvailableNextYear } = useGetLeaveAllocation(
    nextYear.toString()
  );

  const isLeaveOnlyView = data?.user && visibleTabs.length === 0;
  const showYearSelector =
    isLeaveOnlyView && isEntitlementAvailableNextYear?.length > 0;

  useGoogleAnalyticsEvent({
    onMountEventType:
      data?.user && visibleTabs.length === 0
        ? GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_DASHBOARD_VIEWED
        : GoogleAnalyticsTypes.GA4_DASHBOARD_VIEWED,
    triggerOnMount: true
  });

  if (showLoader && query.status === SUCCESS) {
    return <LogoColorLoader />;
  }

  // Render custom dashboard for flagged tenants
  if (tempUseCustomDashboard) {
    return (
      <ContentLayout
        pageHead={translateText(["pageHead"])}
        title={translateText(["title"])}
        isDividerVisible={true}
      >
        <>
          <div style={{ marginTop: "1rem" }}>
            <APICTADashboard />
          </div>
          <LeaveManagerModalController />
        </>
      </ContentLayout>
    );
  }

  // Default dashboard
  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={
        data?.user && visibleTabs.length === 0
          ? translateText(["myLeaveAllocations"])
          : translateText(["title"])
      }
      isDividerVisible={!(data?.user && visibleTabs.length === 0)}
      customRightContent={
        showYearSelector ? (
          <LeaveYearSelector
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        ) : (
          <></>
        )
      }
    >
      <>
        {isLeaveOnlyView ? (
          <div>
            <LeaveAllocationSummary />
          </div>
        ) : (
          <TabsContainer tabs={visibleTabs} />
        )}

        <VersionUpgradeModal />
        <LeaveManagerModalController />
      </>
    </ContentLayout>
  );
};

export default Dashboard;
