import { NextPage } from "next";
import { useRouter } from "next/router";
import { useShallow } from "zustand/react/shallow";

import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveTypesTable from "~community/leave/components/molecules/LeaveTypesTable/LeaveTypesTable";
import PolicyLeaveTypesTable from "~community/leave/components/molecules/PolicyLeaveTypesTable/PolicyLeaveTypesTable";
import { LeaveTypeFormTypes } from "~community/leave/enums/LeaveTypeEnums";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import useProductTour from "~enterprise/common/hooks/useProductTour";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const LeaveTypes: NextPage = () => {
  const translateText = useTranslator("leaveModule");

  const router = useRouter();

  const { ongoingQuickSetup } = useCommonEnterpriseStore(
    useShallow((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup
    }))
  );

  const { destroyDriverObj } = useProductTour();

  const { isLeavePoliciesEnabled, isLoading: isLeavePolicyConfigLoading } =
    useLeavePoliciesEnabled();

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_LEAVE_TYPE_PAGE_VISITED,
    triggerOnMount: true
  });

  const getLeaveTypesTable = () => {
    if (isLeavePolicyConfigLoading) {
      return <FullScreenLoader />;
    }

    if (isLeavePoliciesEnabled) {
      return <PolicyLeaveTypesTable />;
    }

    return <LeaveTypesTable />;
  };

  const leaveTypesTable = getLeaveTypesTable();

  return (
    <>
      <ContentLayout
        breadcrumbs={[
          {
            label: translateText(["analytics.stepLeave"])
          },
          {
            label: translateText(["leaveTypes.title"])
          }
        ]}
        title={translateText(["leaveTypes.title"])}
        pageHead={translateText(["leaveTypes.pageHead"])}
        primaryButtonText={translateText(["leaveTypes.addLeaveBtnTxt"])}
        onPrimaryButtonClick={() => {
          router.push(
            ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.ADD)
          );
          destroyDriverObj();
        }}
        isDividerVisible
        id={{
          primaryBtn: "add-leave-type-btn"
        }}
        shouldBlink={{
          primaryBtn: ongoingQuickSetup.SETUP_LEAVE_TYPES
        }}
      >
        {leaveTypesTable}
      </ContentLayout>
    </>
  );
};

export default LeaveTypes;
