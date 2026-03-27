import { SmallModal } from "@rootcodelabs/skapp-ui";
import { Dispatch, FC, ReactNode, SetStateAction, useMemo } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import AddJobFamilyModal from "~community/people/components/organisms/JobFamilyModals/JobFamilyFormModals/AddJobFamilyModal";
import EditJobFamilyModal from "~community/people/components/organisms/JobFamilyModals/JobFamilyFormModals/EditJobFamilyModal";
import JobFamilyTransferMembersModal from "~community/people/components/organisms/JobFamilyModals/TransferMembersModals/JobFamilyTransferMembersModal";
import JobTitleTransferMembersModal from "~community/people/components/organisms/JobFamilyModals/TransferMembersModals/JobTitleTransferMembersModal";
import AddNewJobFamily from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/AddNewJobFamily";
import AddNewJobTitle from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/AddNewJobTitle";
import JobFamilyDeleteConfirmationModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/JobFamilyDeleteConfirmationModal";
import JobFamilyDeletionWarningModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/JobFamilyDeletionWarningModal";
import JobTitleDeleteConfirmationModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/JobTitleDeleteConfirmationModal";
import JobTitleDeletionWarningModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/JobTitleDeletionWarningModal";
import JobTitleEditConfirmationModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/JobTitleEditConfirmationModal";
import UnsavedChangesModal from "~community/people/components/organisms/JobFamilyModals/UserPromptModals/UnsavedChangesModal";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import {
  checkDataChanges,
  getModalTitle,
  handleJobFamilyCloseModal
} from "~community/people/utils/jobFamilyUtils/modalControllerUtils";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  setLatestRoleLabel?: Dispatch<SetStateAction<number | undefined>>;
  from?: string;
}

const JobFamilyModalController: FC<Props> = ({ setLatestRoleLabel, from }) => {
  const { isPeopleAdmin } = useSessionData();

  const peopleTranslateText = useTranslator("peopleModule", "jobFamily");

  const {
    currentTransferMembersData,
    isJobFamilyModalOpen,
    jobFamilyModalType,
    currentEditingJobFamily,
    allJobFamilies,
    setJobFamilyModalType,
    setIsJobFamilyModalOpen
  } = usePeopleStore((state) => ({
    currentTransferMembersData: state.currentTransferMembersData,
    isJobFamilyModalOpen: state.isJobFamilyModalOpen,
    jobFamilyModalType: state.jobFamilyModalType,
    currentEditingJobFamily: state.currentEditingJobFamily,
    allJobFamilies: state.allJobFamilies,
    setJobFamilyModalType: state.setJobFamilyModalType,
    setIsJobFamilyModalOpen: state.setIsJobFamilyModalOpen
  }));

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const hasDataChanged: boolean = useMemo(() => {
    return checkDataChanges(
      jobFamilyModalType,
      currentEditingJobFamily,
      allJobFamilies,
      currentTransferMembersData
    );
  }, [
    jobFamilyModalType,
    currentTransferMembersData,
    currentEditingJobFamily,
    allJobFamilies
  ]);

  const handleCloseModal = (): void => {
    if (
      jobFamilyModalType ===
        JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY ||
      jobFamilyModalType ===
        JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY_TRANSFER_MEMBERS ||
      jobFamilyModalType ===
        JobFamilyActionModalEnums.UNSAVED_CHANGED_JOB_TITLE_TRANSFER_MEMBERS
    ) {
      setIsJobFamilyModalOpen(false);
      setJobFamilyModalType(JobFamilyActionModalEnums.NONE);
      return;
    }
    handleJobFamilyCloseModal({
      hasDataChanged,
      jobFamilyModalType,
      setJobFamilyModalType,
      stopAllOngoingQuickSetup
    });
  };

  const modalContent = (): ReactNode => {
    switch (jobFamilyModalType) {
      case JobFamilyActionModalEnums.ADD_JOB_FAMILY:
        return (
          <AddJobFamilyModal
            hasDataChanged={hasDataChanged}
            setLatestRoleLabel={setLatestRoleLabel}
            from={from}
          />
        );
      case JobFamilyActionModalEnums.EDIT_JOB_FAMILY:
        return <EditJobFamilyModal hasDataChanged={hasDataChanged} />;
      case JobFamilyActionModalEnums.JOB_FAMILY_DELETE_CONFIRMATION:
        return <JobFamilyDeleteConfirmationModal />;
      case JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING:
        return <JobFamilyDeletionWarningModal />;
      case JobFamilyActionModalEnums.JOB_TITLE_DELETE_CONFIRMATION:
        return <JobTitleDeleteConfirmationModal />;
      case JobFamilyActionModalEnums.JOB_TITLE_DELETION_WARNING:
        return <JobTitleDeletionWarningModal />;
      case JobFamilyActionModalEnums.JOB_TITLE_EDIT_CONFIRMATION:
        return <JobTitleEditConfirmationModal />;
      case JobFamilyActionModalEnums.ADD_NEW_JOB_FAMILY:
        return <AddNewJobFamily />;
      case JobFamilyActionModalEnums.ADD_NEW_JOB_TITLE:
        return <AddNewJobTitle />;
      case JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS:
        return <JobFamilyTransferMembersModal />;
      case JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS:
        return <JobTitleTransferMembersModal />;
      case JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY:
      case JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY_TRANSFER_MEMBERS:
      case JobFamilyActionModalEnums.UNSAVED_CHANGED_JOB_TITLE_TRANSFER_MEMBERS:
        return <UnsavedChangesModal />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={
        isJobFamilyModalOpen &&
        jobFamilyModalType !== JobFamilyActionModalEnums.NONE
      }
      onClose={handleCloseModal}
      modalHeader={
        isPeopleAdmin
          ? getModalTitle(jobFamilyModalType, peopleTranslateText)
          : peopleTranslateText(["viewJobFamilyTitle"])
      }
      content={modalContent()}
    />
  );
};

export default JobFamilyModalController;
