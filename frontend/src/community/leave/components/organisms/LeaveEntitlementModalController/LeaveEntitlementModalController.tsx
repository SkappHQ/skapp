import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import DownloadCsv from "~community/leave/components/molecules/LeaveEntitlementModals/DownloadCsv/DownloadCsv";
import LeaveEntitlementBulkUploadSummary from "~community/leave/components/molecules/LeaveEntitlementModals/LeaveEntitlementBulkUploadSummary/LeaveEntitlementBulkUploadSummary";
import OverrideConfirmation from "~community/leave/components/molecules/LeaveEntitlementModals/OverrideConfirmation/OverrideConfirmation";
import UploadCsv from "~community/leave/components/molecules/LeaveEntitlementModals/UploadCsv/UploadCsv";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

const LeaveEntitlementModalController: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveEntitlements");
  const commonTranslateText = useTranslator(
    "commonComponents",
    "userPromptModal",
    "bulkUploadSummaryModal"
  );

  const {
    isLeaveEntitlementModalOpen,
    leaveEntitlementModalType,
    selectedYear,
    setLeaveEntitlementModalType
  } = useLeaveStore((state) => state);

  const [errorLog, setErrorLog] = useState<BulkUploadResponse | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeType[]>([]);

  const getModalTitle = (): string => {
    switch (leaveEntitlementModalType) {
      case LeaveEntitlementModelTypes.DOWNLOAD_CSV:
      case LeaveEntitlementModelTypes.UPLOAD_CSV:
        return translateText(["addEntitlementsModalTitle"]);
      case LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION:
        return translateText(["overrideConfirmationModalTitle"], {
          uploadingYear: selectedYear
        });
      case LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY:
        return commonTranslateText(["title"]);
      default:
        return "";
    }
  };

  const handleCloseModal = () => {
    if (
      leaveEntitlementModalType ===
      LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION
    )
      return;
    setLeaveEntitlementModalType(LeaveEntitlementModelTypes.NONE);

    if (
      leaveEntitlementModalType ===
      LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY
    ) {
      setErrorLog(null);
    }
  };

  const modalContent = (): ReactNode => {
    switch (leaveEntitlementModalType) {
      case LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION:
        return <OverrideConfirmation />;
      case LeaveEntitlementModelTypes.DOWNLOAD_CSV:
        return <DownloadCsv />;
      case LeaveEntitlementModelTypes.UPLOAD_CSV:
        return (
          <UploadCsv
            leaveTypes={leaveTypes}
            setLeaveTypes={setLeaveTypes}
            setErrorLog={setErrorLog}
          />
        );
      case LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY:
        return (
          <LeaveEntitlementBulkUploadSummary
            leaveTypes={leaveTypes}
            errorLog={errorLog}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={
        isLeaveEntitlementModalOpen &&
        leaveEntitlementModalType !== LeaveEntitlementModelTypes.NONE
      }
      onClose={handleCloseModal}
      modalHeader={getModalTitle()}
      content={modalContent()}
    />
  );
};

export default LeaveEntitlementModalController;
