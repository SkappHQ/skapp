import { FC, useState } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
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

  const getIds = (): {
    title?: string;
    description?: string;
    closeButton?: string;
  } => {
    switch (leaveEntitlementModalType) {
      case LeaveEntitlementModelTypes.DOWNLOAD_CSV:
        return {
          title: "download-csv-modal-title",
          description: "download-csv-modal-description",
          closeButton: "download-csv-modal-close-button"
        };
      case LeaveEntitlementModelTypes.UPLOAD_CSV:
        return {
          title: "upload-csv-modal-title",
          description: "upload-csv-modal-description",
          closeButton: "upload-csv-modal-close-button"
        };
      case LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION:
        return {
          title: "override-confirmation-modal-title",
          description: "override-confirmation-modal-description",
          closeButton: "override-confirmation-modal-close-button"
        };
      case LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY:
        return {
          title: "bulk-upload-summary-modal-title",
          description: "bulk-upload-summary-modal-description",
          closeButton: "bulk-upload-summary-modal-close-button"
        };
      default:
        return {
          title: "modal-title",
          description: "modal-description",
          closeButton: "modal-close-button"
        };
    }
  };

  const handleCloseModal = () => {
    setLeaveEntitlementModalType(LeaveEntitlementModelTypes.NONE);

    if (
      leaveEntitlementModalType ===
      LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY
    ) {
      setErrorLog(null);
    }
  };

  return (
    <ModalController
      ids={getIds()}
      isModalOpen={isLeaveEntitlementModalOpen}
      handleCloseModal={handleCloseModal}
      modalTitle={getModalTitle()}
      isClosable={
        LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION !==
        leaveEntitlementModalType
      }
    >
      <>
        {leaveEntitlementModalType ===
          LeaveEntitlementModelTypes.OVERRIDE_CONFIRMATION && (
          <OverrideConfirmation />
        )}
        {leaveEntitlementModalType ===
          LeaveEntitlementModelTypes.DOWNLOAD_CSV && <DownloadCsv />}
        {leaveEntitlementModalType ===
          LeaveEntitlementModelTypes.UPLOAD_CSV && (
          <UploadCsv
            leaveTypes={leaveTypes}
            setLeaveTypes={setLeaveTypes}
            setErrorLog={setErrorLog}
          />
        )}
        {leaveEntitlementModalType ===
          LeaveEntitlementModelTypes.BULK_UPLOAD_SUMMARY && (
          <LeaveEntitlementBulkUploadSummary
            leaveTypes={leaveTypes}
            errorLog={errorLog}
          />
        )}
      </>
    </ModalController>
  );
};

export default LeaveEntitlementModalController;
