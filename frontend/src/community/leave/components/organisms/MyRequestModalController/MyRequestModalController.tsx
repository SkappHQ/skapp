import { LargeModal, SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddAttachmentModal from "~community/leave/components/molecules/MyLeaveRequestsModals/AddAttachmentModal/AddAttachmentModal";
import ApplyLeaveModal from "~community/leave/components/molecules/MyLeaveRequestsModals/ApplyLeaveModal/ApplyLeaveModal";
import LeaveTypeSelectionModal from "~community/leave/components/molecules/MyLeaveRequestsModals/LeaveTypeSelectionModal/LeaveTypeSelectionModal";
import TeamAvailabilityModal from "~community/leave/components/molecules/MyLeaveRequestsModals/TeamAvailabilityModal/TeamAvailabilityModal";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";
import MarkOutOfOfficeModal from "~enterprise/leave/components/molecules/MyLeaveRequestModals/MarkOutOfOfficeModal";

const MyRequestModalController = () => {
  const translateText = useTranslator("leaveModule", "myRequests");

  const {
    isMyRequestModalOpen,
    myRequestModalType,
    setMyLeaveRequestModalType
  } = useLeaveStore();

  const modalTitle = useMemo(() => {
    switch (myRequestModalType) {
      case MyRequestModalEnums.APPLY_LEAVE:
      case MyRequestModalEnums.LEAVE_TYPE_SELECTION:
        return translateText(["applyLeaveModal", "title"]);
      case MyRequestModalEnums.TEAM_AVAILABILITY:
        return translateText(["teamAvailabilityCard", "title"]);
      case MyRequestModalEnums.ADD_ATTACHMENT:
        return translateText(["addAttachmentModal", "title"]);
      case MyRequestModalEnums.MARK_OUT_OF_OFFICE:
        return translateText(["applyLeaveModal", "markOutOfOfficeModalTitle"]);
      default:
        return "";
    }
  }, [myRequestModalType, translateText]);

  const handleCloseModal = () => {
    switch (myRequestModalType) {
      case MyRequestModalEnums.APPLY_LEAVE:
      case MyRequestModalEnums.LEAVE_TYPE_SELECTION:
      case MyRequestModalEnums.MARK_OUT_OF_OFFICE:
        setMyLeaveRequestModalType(MyRequestModalEnums.NONE);
        break;
      case MyRequestModalEnums.TEAM_AVAILABILITY:
      case MyRequestModalEnums.ADD_ATTACHMENT:
        setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE);
        break;
      default:
        break;
    }
  };

  const modalContent = (): ReactNode => {
    switch (myRequestModalType) {
      case MyRequestModalEnums.APPLY_LEAVE:
        return <ApplyLeaveModal />;
      case MyRequestModalEnums.LEAVE_TYPE_SELECTION:
        return <LeaveTypeSelectionModal />;
      case MyRequestModalEnums.TEAM_AVAILABILITY:
        return <TeamAvailabilityModal />;
      case MyRequestModalEnums.ADD_ATTACHMENT:
        return <AddAttachmentModal />;
      case MyRequestModalEnums.MARK_OUT_OF_OFFICE:
        return <MarkOutOfOfficeModal />;
      default:
        return null;
    }
  };

  const isLargeModal =
    myRequestModalType === MyRequestModalEnums.APPLY_LEAVE ||
    myRequestModalType === MyRequestModalEnums.LEAVE_TYPE_SELECTION;

  if (isLargeModal) {
    return (
      <LargeModal
        id="apply-leave-modal"
        isOpen={isMyRequestModalOpen}
        onClose={handleCloseModal}
        modalHeader={modalTitle}
        content={modalContent()}
        backdropVariant="dark"
        className="w-[75vw] max-w-[1100px]"
      />
    );
  }

  return (
    <SmallModal
      isOpen={
        isMyRequestModalOpen && myRequestModalType !== MyRequestModalEnums.NONE
      }
      onClose={handleCloseModal}
      modalHeader={modalTitle}
      content={modalContent()}
    />
  );
};

export default MyRequestModalController;
