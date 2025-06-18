import { useMemo } from "react";

import { SelectOption } from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useDeleteJobFamily,
  useTransferMembersWithJobFamily
} from "~community/people/api/JobFamilyApi";
import TransferMembersModal from "~community/people/components/molecules/TransferMembersModal/TransferMembersModal";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { TransferMemberFormType } from "~community/people/types/JobFamilyTypes";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import {
  jobFamilyTransferMembersCancelBtnClick,
  jobFamilyTransferMembersSubmitBtnClick
} from "~community/people/utils/jobFamilyUtils/jobFamilyUtils";

const JobFamilyTransferMembersModal = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setToastMessage } = useToast();

  const {
    allJobFamilies,
    currentDeletingJobFamily,
    currentTransferMembersData,
    setJobFamilyModalType,
    setCurrentTransferMembersData
  } = usePeopleStore((state) => state);

  const initialValues: TransferMemberFormType[] | undefined = useMemo(() => {
    return currentDeletingJobFamily?.employees.map((employee) => ({
      employeeId: employee.employeeId,
      jobFamily: null,
      jobTitle: null
    }));
  }, [currentDeletingJobFamily]);

  const jobFamily: SelectOption[] = useMemo(() => {
    return (
      allJobFamilies
        ?.filter(
          (jobFamily) =>
            jobFamily.jobFamilyId !== currentDeletingJobFamily?.jobFamilyId
        )
        .map((jobFamily) => ({
          label: jobFamily.name,
          value: jobFamily.jobFamilyId
        })) ?? []
    );
  }, [allJobFamilies, currentDeletingJobFamily]);

  const employees = useMemo(() => {
    return currentDeletingJobFamily?.employees;
  }, [currentDeletingJobFamily]);

  const onTransferSuccess = () => {
    deleteJobFamilyMutate(currentDeletingJobFamily?.jobFamilyId ?? 0);
  };

  const onDeleteSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_FAMILY_TRANSFER_MEMBERS_SUCCESS,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.JOB_FAMILY_TRANSFER_MEMBERS_ERROR,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const { mutate: transferMembersWithJobFamily } =
    useTransferMembersWithJobFamily(onTransferSuccess, onError);

  const { mutate: deleteJobFamilyMutate } = useDeleteJobFamily(
    onDeleteSuccess,
    onError
  );

  return (
    <TransferMembersModal
      jobFamilyTransfer
      initialValues={initialValues}
      description={translateText(["jobFamilyTransferModalDescription"])}
      primaryBtnText={translateText(["jobFamilyTransferModalBtn"])}
      jobFamily={jobFamily}
      employees={employees}
      handleSubmit={() =>
        jobFamilyTransferMembersSubmitBtnClick(
          currentDeletingJobFamily,
          currentTransferMembersData,
          transferMembersWithJobFamily,
          setToastMessage,
          translateText
        )
      }
      handleCancel={() =>
        jobFamilyTransferMembersCancelBtnClick(
          setJobFamilyModalType,
          setCurrentTransferMembersData
        )
      }
    />
  );
};

export default JobFamilyTransferMembersModal;
