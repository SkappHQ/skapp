import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditJobFamily } from "~community/people/api/JobFamilyApi";
import JobFamilyFormModal from "~community/people/components/molecules/JobFamilyFormModal/JobFamilyFormModal";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { AddJobFamilyFormType } from "~community/people/types/JobFamilyTypes";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";

interface Props {
  hasDataChanged: boolean;
}

const EditJobFamilyModal = ({ hasDataChanged }: Props) => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setToastMessage } = useToast();

  const { setJobFamilyModalType } = usePeopleStore((state) => state);

  const onSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_FAMILY_SUCCESS,
      setToastMessage,
      setJobFamilyModalType,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_FAMILY_ERROR,
      setToastMessage,
      setJobFamilyModalType,
      translateText
    });
  };

  const { mutate: editJobTitleMutate } = useEditJobFamily(onSuccess, onError);

  const onSubmit = (values: AddJobFamilyFormType) => {
    if (!hasDataChanged) {
      return;
    }

    const jobFamilyData = {
      jobFamilyId: values.jobFamilyId,
      name: values.name.trim(),
      titles: values.jobTitles
    };

    editJobTitleMutate(jobFamilyData);
  };

  return (
    <JobFamilyFormModal hasDataChanged={hasDataChanged} onSubmit={onSubmit} />
  );
};

export default EditJobFamilyModal;
