import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveTypeActivationToggleButton from "~community/leave/components/molecules/LeaveTypeActivationToggleButton/LeaveTypeActivationToggleButton";
import UnsavedChangesModal from "~community/leave/components/molecules/UserPromptModals/UnsavedChangesModal/UnsavedChangesModal";
import LeaveTypeForm from "~community/leave/components/organisms/LeaveTypeForm/LeaveTypeForm";
import {
  LeaveTypeFormTypes,
  LeaveTypeModalEnums
} from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const LeaveType: NextPage = () => {
  const translateText = useTranslator("leaveModule");
  const router = useRouter();
  const { slug } = router.query;

  const {
    isLeaveTypeFormDirty,
    isLeaveTypeModalOpen,
    setLeaveTypeModalType,
    resetEditingLeaveType,
    setPendingNavigation
  } = useLeaveStore((state) => ({
    isLeaveTypeFormDirty: state.isLeaveTypeFormDirty,
    isLeaveTypeModalOpen: state.isLeaveTypeModalOpen,
    setLeaveTypeModalType: state.setLeaveTypeModalType,
    resetEditingLeaveType: state.resetEditingLeaveType,
    setPendingNavigation: state.setPendingNavigation
  }));

  const { ongoingQuickSetup, stopAllOngoingQuickSetup } =
    useCommonEnterpriseStore((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup,
      stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
    }));

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (ongoingQuickSetup.SETUP_LEAVE_TYPES) {
        stopAllOngoingQuickSetup();
      }
      if (isLeaveTypeFormDirty && !isLeaveTypeModalOpen) {
        setPendingNavigation(url);
        setLeaveTypeModalType(LeaveTypeModalEnums.UNSAVED_CHANGES_MODAL);
        router.events.emit("routeChangeError");
        throw "routeChange aborted";
      } else {
        resetEditingLeaveType();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return "";
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [ongoingQuickSetup, isLeaveTypeFormDirty, isLeaveTypeModalOpen]);

  const handleBackBtnClick = () => {
    if (ongoingQuickSetup.SETUP_LEAVE_TYPES) {
      stopAllOngoingQuickSetup();
    }
    router.push(ROUTES.LEAVE.LEAVE_TYPES);
  };

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["analytics.stepLeave"])
        },
        {
          label: translateText(["leaveTypes.title"]),
          href: ROUTES.LEAVE.TYPES
        },
        {
          label:
            slug === LeaveTypeFormTypes.EDIT
              ? translateText(["leaveTypes.editLeaveType"])
              : translateText(["leaveTypes.addLeaveType"])
        }
      ]}
      title={
        slug === LeaveTypeFormTypes.EDIT
          ? translateText(["leaveTypes.editLeaveType"])
          : translateText(["leaveTypes.addLeaveType"])
      }
      pageHead={translateText(["leaveTypes.pageHead"])}
      isDividerVisible
      isBackButtonVisible
      onBackClick={handleBackBtnClick}
      customRightContent={
        slug === LeaveTypeFormTypes.EDIT ? (
          <LeaveTypeActivationToggleButton />
        ) : (
          <></>
        )
      }
    >
      <>
        <LeaveTypeForm />
        <UnsavedChangesModal />
      </>
    </ContentLayout>
  );
};

export default LeaveType;
