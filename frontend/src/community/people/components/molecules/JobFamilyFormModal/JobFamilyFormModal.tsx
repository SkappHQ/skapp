import { Box } from "@mui/material";
import { Button } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { useEffect, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { characterLengths } from "~community/common/constants/stringConstants";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import JobTitleField from "~community/people/components/molecules/JobTitleField/JobTitleField";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { AddJobFamilyFormType } from "~community/people/types/JobFamilyTypes";
import { sortJobTitlesArrayInAscendingOrder } from "~community/people/utils/jobFamilyUtils/commonUtils";
import { handleJobFamilyNameInputChange } from "~community/people/utils/jobFamilyUtils/jobFamilyUtils";
import { handleJobFamilyCloseModal } from "~community/people/utils/jobFamilyUtils/modalControllerUtils";
import { addEditJobFamilyValidationSchema } from "~community/people/utils/validation";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  hasDataChanged: boolean;
  onSubmit: (values: AddJobFamilyFormType) => void;
}

const JobFamilyFormModal = ({ hasDataChanged, onSubmit }: Props) => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { isPeopleAdmin } = useSessionData();

  const {
    allJobFamilies,
    jobFamilyModalType,
    currentEditingJobFamily,
    setJobFamilyModalType,
    setCurrentEditingJobFamily
  } = usePeopleStore((state) => ({
    allJobFamilies: state.allJobFamilies,
    jobFamilyModalType: state.jobFamilyModalType,
    currentEditingJobFamily: state.currentEditingJobFamily,
    setJobFamilyModalType: state.setJobFamilyModalType,
    setCurrentEditingJobFamily: state.setCurrentEditingJobFamily
  }));

  const { ongoingQuickSetup, stopAllOngoingQuickSetup } =
    useCommonEnterpriseStore((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup,
      stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
    }));

  const initialValues: AddJobFamilyFormType = {
    jobFamilyId: currentEditingJobFamily?.jobFamilyId ?? 0,
    name: currentEditingJobFamily?.name ?? "",
    jobTitleInput: "",
    jobTitles: currentEditingJobFamily?.jobTitles ?? []
  };

  const formik = useFormik({
    initialValues,
    onSubmit: onSubmit,
    validateOnChange: true,
    validationSchema: addEditJobFamilyValidationSchema(
      allJobFamilies ?? [],
      translateText
    )
  });

  const { values, errors, handleSubmit, setFieldValue, setFieldError } = formik;

  const isSaveBtnDisabled = useMemo(() => {
    if (jobFamilyModalType === JobFamilyActionModalEnums.EDIT_JOB_FAMILY) {
      return (
        !!errors.name ||
        !!errors.jobTitleInput ||
        !!errors.jobTitles ||
        !hasDataChanged
      );
    } else {
      return false;
    }
  }, [
    errors.jobTitleInput,
    errors.jobTitles,
    errors.name,
    hasDataChanged,
    jobFamilyModalType
  ]);

  useEffect(() => {
    const sortedJobTitles = sortJobTitlesArrayInAscendingOrder(
      values.jobTitles
    );

    setCurrentEditingJobFamily({
      jobFamilyId: values.jobFamilyId,
      name: values.name.trim(),
      jobTitles: sortedJobTitles
    });
  }, [setCurrentEditingJobFamily, values]);

  return (
    <Form onSubmit={handleSubmit}>
      <Box component="div" aria-hidden={true}>
        <InputField
          id="job-family-name-input"
          inputName="name"
          label={translateText(["jobFamilyInputField.label"])}
          placeHolder={translateText(["jobFamilyInputField.placeholder"])}
          error={errors.name}
          value={values.name}
          onChange={(event) =>
            handleJobFamilyNameInputChange(event, setFieldValue, setFieldError)
          }
          required
          maxLength={characterLengths.JOB_FAMILY_LENGTH}
          isDisabled={!isPeopleAdmin}
        />
        <JobTitleField formik={formik} />
        {!isPeopleAdmin ? (
          <Button
            variant={"tertiary"}
            onClick={() =>
              handleJobFamilyCloseModal({
                hasDataChanged,
                jobFamilyModalType,
                setJobFamilyModalType,
                stopAllOngoingQuickSetup
              })
            }
            icon={<Icon name={IconName.LEFT_ARROW_ICON} />}
            iconPosition="start"
          >
            {translateText(["goBackBtnText"])}
          </Button>
        ) : (
          <>
            <Button
              type={"submit"}
              disabled={isSaveBtnDisabled}
              variant={"primary"}
              className={
                (
                  values.name && values.jobTitles?.length > 0
                    ? ongoingQuickSetup.DEFINE_JOB_FAMILIES
                    : false
                )
                  ? "animate-pulse"
                  : ""
              }
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["saveBtnText"])}
            </Button>
            <Button
              variant={"tertiary"}
              onClick={() =>
                handleJobFamilyCloseModal({
                  hasDataChanged,
                  jobFamilyModalType,
                  setJobFamilyModalType,
                  stopAllOngoingQuickSetup
                })
              }
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateText(["cancelBtnText"])}
            </Button>
          </>
        )}
      </Box>
    </Form>
  );
};

export default JobFamilyFormModal;
