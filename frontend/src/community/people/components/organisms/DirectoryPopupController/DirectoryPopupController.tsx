import { LargeModal, SmallModal } from "@rootcodelabs/skapp-ui";
import { useState } from "react";

import { BulkSummaryFlows } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import AddNewResourceModal from "~community/people/components/molecules/AddNewResourceModal/AddNewResourceModal";
import AddResourceUnsavedChangesModal from "~community/people/components/molecules/AddResourceUnsavedChangesModal/AddResourceUnsavedChangesModal";
import GuestToInternalUserConfirmationModal from "~community/people/components/molecules/GuestToInternalUserConfirmationModal/GuestToInternalUserConfirmationModal";
import LoginCredentialsModal from "~community/people/components/molecules/LoginCredentialsModal/LoginCredentialsModal";
import BulkUploadSummary from "~community/people/components/molecules/UserBulkUploadModals/BulkUploadSummary";
import UserBulkCsvDownload from "~community/people/components/molecules/UserBulkUploadModals/UserBulkCsvDownload";
import UserBulkCsvUpload from "~community/people/components/molecules/UserBulkUploadModals/UserBulkCsvUpload";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import ConnectGoogleWorkspaceModal from "~enterprise/people/components/molecules/ConnectGoogleWorkspaceModal/ConnectGoogleWorkspaceModal";
import UploadTypeSelectModal from "~enterprise/people/components/molecules/UploadTypeSelectModal/UploadTypeSelectModal";

const DirectoryPopupController = () => {
  const translatedTexts = useTranslator("peopleModule", "peoples");
  const translateGoogleWorkspace = useTranslator(
    "peopleEnterprise",
    "googleWorkspaceImport"
  );

  const {
    directoryModalType,
    isDirectoryModalOpen,
    setDirectoryModalType,
    setBulkUploadUsers,
    pendingAddResourceData
  } = usePeopleStore((state) => state);

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const [bulkUploadData, setBulkUploadData] = useState<BulkUploadResponse>();

  const getModalTitle = (): string => {
    switch (directoryModalType) {
      case DirectoryModalTypes.DOWNLOAD_CSV:
        return translatedTexts(["uploadCsvModalTitle"]);
      case DirectoryModalTypes.UPLOAD_CSV:
        return translatedTexts(["uploadCsvModalTitle"]);
      case DirectoryModalTypes.UPLOAD_SUMMARY:
        return translatedTexts(["uploadSummeryModalTitle"]);
      case DirectoryModalTypes.ADD_NEW_RESOURCE:
        return "Add people";
      case DirectoryModalTypes.UPLOAD_TYPE_SELECT:
        return translateGoogleWorkspace(["chooserTitle"]);
      case DirectoryModalTypes.USER_CREDENTIALS:
        return translatedTexts(["shareCredentials"]);
      case DirectoryModalTypes.UNSAVED_CHANGES:
        return translatedTexts(["unsavedModalTitle"]);
      case DirectoryModalTypes.GUEST_TO_INTERNAL_USER_CONFIRMATION:
        return translatedTexts(["guestUserConfirmationModalTitle"]);
      default:
        return "";
    }
  };

  const onClose = (): void => {
    if (
      directoryModalType ===
      DirectoryModalTypes.GUEST_TO_INTERNAL_USER_CONFIRMATION
    ) {
      setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
      return;
    }

    if (
      directoryModalType === DirectoryModalTypes.ADD_NEW_RESOURCE &&
      pendingAddResourceData
    ) {
      setDirectoryModalType(DirectoryModalTypes.UNSAVED_CHANGES);
      return;
    }

    setBulkUploadUsers([]);
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      stopAllOngoingQuickSetup();
      if (directoryModalType === DirectoryModalTypes.UPLOAD_SUMMARY) {
        setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      }
    }
    setDirectoryModalType(DirectoryModalTypes.NONE);
  };

  const modalContent = (
    <>
      {directoryModalType === DirectoryModalTypes.DOWNLOAD_CSV && (
        <UserBulkCsvDownload />
      )}
      {directoryModalType === DirectoryModalTypes.UPLOAD_CSV && (
        <UserBulkCsvUpload
          setBulkUploadData={setBulkUploadData}
          setPopupType={setDirectoryModalType}
        />
      )}
      {bulkUploadData &&
        directoryModalType === DirectoryModalTypes.UPLOAD_SUMMARY &&
        bulkUploadData?.bulkStatusSummary?.failedCount > 0 && (
          <BulkUploadSummary
            setPopupType={setDirectoryModalType}
            data={bulkUploadData}
            flow={BulkSummaryFlows.USER_BULK_UPLOAD}
          />
        )}
      {directoryModalType === DirectoryModalTypes.ADD_NEW_RESOURCE && (
        <AddNewResourceModal />
      )}
      {directoryModalType === DirectoryModalTypes.UNSAVED_CHANGES && (
        <AddResourceUnsavedChangesModal />
      )}
      {directoryModalType === DirectoryModalTypes.USER_CREDENTIALS && (
        <LoginCredentialsModal />
      )}
      {directoryModalType ===
        DirectoryModalTypes.GUEST_TO_INTERNAL_USER_CONFIRMATION && (
        <GuestToInternalUserConfirmationModal />
      )}
      {directoryModalType === DirectoryModalTypes.UPLOAD_TYPE_SELECT && (
        <UploadTypeSelectModal />
      )}
    </>
  );

  if (directoryModalType === DirectoryModalTypes.CONNECT_GOOGLE_WORKSPACE) {
    return (
      <ConnectGoogleWorkspaceModal
        isOpen={isDirectoryModalOpen}
        onClose={onClose}
      />
    );
  }

  if (directoryModalType === DirectoryModalTypes.UPLOAD_TYPE_SELECT) {
    return (
      <LargeModal
        id="import-people-modal"
        isOpen={isDirectoryModalOpen}
        onClose={onClose}
        modalHeader={getModalTitle()}
        className="relative w-[831px] h-fit max-h-[85vh] overflow-hidden"
        content={modalContent}
      />
    );
  }

  return (
    <SmallModal
      isOpen={isDirectoryModalOpen}
      onClose={onClose}
      modalHeader={getModalTitle()}
      content={modalContent}
    />
  );
};

export default DirectoryPopupController;
