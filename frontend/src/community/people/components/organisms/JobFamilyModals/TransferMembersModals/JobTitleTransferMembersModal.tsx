import { useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useDeleteJobTitle,
  useTransferMembersWithJobTitle
} from "~community/people/api/JobFamilyApi";
import TransferMembersModal from "~community/people/components/molecules/TransferMembersModal/TransferMembersModal";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { TransferMemberFormType } from "~community/people/types/JobFamilyTypes";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import {
  getEmployeesWithJobTitle,
  handleJobTitleDeleteBackBtnClick,
  jobTitleTransferMembersModalSubmitBtnClick
} from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

const JobTitleTransferMembersModal = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setToastMessage } = useToast();

  const {
    allJobFamilies,
    previousJobTitleData,
    currentEditingJobFamily,
    currentTransferMembersData,
    setJobFamilyModalType,
    setPreviousJobTitleData,
    setCurrentEditingJobFamily,
    setCurrentTransferMembersData
  } = usePeopleStore((state) => state);

  const jobFamily = useMemo(() => {
    return [
      {
        jobFamilyId: currentEditingJobFamily?.jobFamilyId ?? 0,
        name: currentEditingJobFamily?.name ?? ""
      }
    ];
  }, [currentEditingJobFamily]);

  const employees = useMemo(() => {
    return getEmployeesWithJobTitle(
      allJobFamilies,
      currentEditingJobFamily?.jobFamilyId ?? 0,
      previousJobTitleData?.name ?? ""
    );
  }, [allJobFamilies, currentEditingJobFamily, previousJobTitleData]);

  const initialValues: TransferMemberFormType[] | undefined = useMemo(() => {
    return employees?.map((employee) => ({
      employeeId: employee.employeeId ?? 0,
      jobFamily: jobFamily[0],
      jobTitle: null
    }));
  }, [jobFamily, employees]);

  const onTransferSuccess = () => {
    deleteJobTitleMutate(previousJobTitleData?.jobTitleId ?? 0);
  };

  const onDeleteSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_TITLE_TRANSFER_MEMBERS_SUCCESS,
      setToastMessage,
      setJobFamilyModalType,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_TITLE_TRANSFER_MEMBERS_ERROR,
      setToastMessage,
      setJobFamilyModalType,
      translateText
    });
  };

  const { mutate: transferMembersWithJobTitle } =
    useTransferMembersWithJobTitle(onTransferSuccess, onError);

  const { mutate: deleteJobTitleMutate } = useDeleteJobTitle(
    onDeleteSuccess,
    onError
  );

  return (
    <TransferMembersModal
      jobFamilyTransfer={false}
      description={translateText(["jobTitleTransferModalDescription"])}
      primaryBtnText={translateText(["jobTitleTransferModalBtn"])}
      initialValues={initialValues}
      jobFamily={jobFamily}
      employees={employees}
      handleSubmit={() =>
        jobTitleTransferMembersModalSubmitBtnClick(
          previousJobTitleData,
          currentTransferMembersData,
          transferMembersWithJobTitle,
          setToastMessage,
          translateText
        )
      }
      handleCancel={() =>
        handleJobTitleDeleteBackBtnClick(
          previousJobTitleData,
          currentEditingJobFamily,
          setJobFamilyModalType,
          setPreviousJobTitleData,
          setCurrentEditingJobFamily,
          setCurrentTransferMembersData
        )
      }
      jobTitleId={previousJobTitleData?.jobTitleId ?? 0}
    />
  );
};

export default JobTitleTransferMembersModal;
