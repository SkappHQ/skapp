import { Dispatch, SetStateAction, useEffect } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useAddJobFamily } from "~community/people/api/JobFamilyApi";
import JobFamilyFormModal from "~community/people/components/molecules/JobFamilyFormModal/JobFamilyFormModal";
import {
  JobFamilyActionModalEnums,
  JobFamilyToastEnums
} from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { AddJobFamilyFormType } from "~community/people/types/JobFamilyTypes";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  hasDataChanged: boolean;
  from?: string;
  setLatestRoleLabel?: Dispatch<SetStateAction<number | undefined>>;
}

const AddJobFamilyModal = ({
  hasDataChanged,
  setLatestRoleLabel,
  from
}: Props) => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setToastMessage } = useToast();

  const { setJobFamilyModalType } = usePeopleStore((state) => ({
    setJobFamilyModalType: state.setJobFamilyModalType
  }));

  const {
    setQuickSetupModalType,
    stopAllOngoingQuickSetup,
    ongoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const addLatestFamilyLabel = (jobTitleId: number) => {
    if (from && from === "add-new-resource" && setLatestRoleLabel) {
      setLatestRoleLabel(jobTitleId);
      setJobFamilyModalType(JobFamilyActionModalEnums.NONE);
    }
  };

  const onSuccess = () => {
    if (ongoingQuickSetup.DEFINE_JOB_FAMILIES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.ADD_JOB_FAMILY_SUCCESS,
      setToastMessage,
      setJobFamilyModalType,
      translateText,
      from
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.ADD_JOB_FAMILY_ERROR,
      setToastMessage,
      setJobFamilyModalType,
      translateText
    });
  };

  const {
    mutate: addJobFamilyMutate,
    data,
    isSuccess
  } = useAddJobFamily(onSuccess, onError);

  const onSubmit = (values: AddJobFamilyFormType) => {
    if (values.jobTitles.length === 0) {
      handleJobFamilyApiResponse({
        type: JobFamilyToastEnums.AT_LEAST_ONE_JOB_TITLE,
        setToastMessage,
        translateText
      });
    } else {
      const jobFamilyData = {
        name: values.name.trim(),
        titles: values.jobTitles.map((jobTitle) => jobTitle.name)
      };

      addJobFamilyMutate(jobFamilyData);
    }
  };

  useEffect(() => {
    if (data && isSuccess) {
      addLatestFamilyLabel(data.data.results[0]?.jobFamilyId);
    }
  }, [data, isSuccess]);

  return (
    <JobFamilyFormModal hasDataChanged={hasDataChanged} onSubmit={onSubmit} />
  );
};

export default AddJobFamilyModal;
