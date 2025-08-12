import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import { theme } from "~community/common/theme/theme";
import { scrollToFirstError } from "~community/common/utils/commonUtil";
import { AccountStatusTypes } from "~community/people/enums/PeopleEnums";
import useStepper from "~community/people/hooks/useStepper";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { useHandlePeopleEdit } from "~community/people/utils/peopleEditFlowUtils/useHandlePeopleEdit";

import AddSectionButtonWrapper from "../../molecules/AddSectionButtonWrapper/AddSectionButtonWrapper";
import EditSectionButtonWrapper from "../../molecules/EditSectionButtonWrapper/EditSectionButtonWrapper";
import ContactDetailsSection from "./SubSections/ContactDetailsSection";
import EducationalDetailsSection from "./SubSections/EducationalDetailsSection";
import FamilyDetailsSection from "./SubSections/FamilyDetailsSection";
import GeneralDetailsSection from "./SubSections/GeneralDetailsSections";
import HealthAndOtherDetailsSection from "./SubSections/HealthAndOtherDetailsSection";
import SocialMediaDetailsSection from "./SubSections/SocialMediaDetailsSection";

interface Props {
  isAddFlow?: boolean;
  isUpdate?: boolean;
  isReadOnly?: boolean;
}

const PersonalDetailsForm = ({
  isAddFlow = false,
  isUpdate = false,
  isReadOnly = false
}: Props) => {
  const generalDetailsRef = useRef<FormMethods | null>(null);
  const contactDetailsRef = useRef<FormMethods | null>(null);
  const socialMediaDetailsRef = useRef<FormMethods | null>(null);
  const healthAndOtherDetailsRef = useRef<FormMethods | null>(null);

  const {
    nextStep,
    currentStep,
    employee,
    isUnsavedModalSaveButtonClicked,
    isUnsavedModalDiscardButtonClicked,
    initialEmployee,
    isCancelModalConfirmButtonClicked,
    setCurrentStep,
    setNextStep,
    setEmployee,
    setIsUnsavedChangesModalOpen,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setIsCancelChangesModalOpen,
    setIsCancelModalConfirmButtonClicked
  } = usePeopleStore((state) => state);

  const { handleMutate } = useHandlePeopleEdit();

  const { handleNext } = useStepper();

  const isTerminatedEmployee =
    employee?.common?.accountStatus === AccountStatusTypes.TERMINATED;

  const onSave = async () => {
    const generalFormErrors = await generalDetailsRef?.current?.validateForm();
    const contactFormErrors = await contactDetailsRef?.current?.validateForm();
    const socialMediaFormErrors =
      await socialMediaDetailsRef?.current?.validateForm();
    const healthAndOtherFormErrors =
      await healthAndOtherDetailsRef?.current?.validateForm();

    const generalFormIsValid =
      generalFormErrors && Object.keys(generalFormErrors).length === 0;
    const contactFormIsValid =
      contactFormErrors && Object.keys(contactFormErrors).length === 0;
    const socialMediaFormIsValid =
      socialMediaFormErrors && Object.keys(socialMediaFormErrors).length === 0;
    const healthAndOtherFormIsValid =
      healthAndOtherFormErrors &&
      Object.keys(healthAndOtherFormErrors).length === 0;

    if (
      generalFormIsValid &&
      contactFormIsValid &&
      socialMediaFormIsValid &&
      healthAndOtherFormIsValid
    ) {
      generalDetailsRef?.current?.submitForm();
      contactDetailsRef?.current?.submitForm();
      socialMediaDetailsRef?.current?.submitForm();
      healthAndOtherDetailsRef?.current?.submitForm();
      if (isAddFlow) {
        handleNext();
      } else {
        setCurrentStep(nextStep);
        setIsUnsavedChangesModalOpen(false);
        setIsUnsavedModalSaveButtonClicked(false);

        handleMutate();
      }
      setEmployee(employee);
    } else {
      setNextStep(currentStep);
      setIsUnsavedChangesModalOpen(false);
      scrollToFirstError(theme);
      setIsUnsavedModalSaveButtonClicked(false);
    }
  };

  const onCancel = () => {
    generalDetailsRef?.current?.resetForm();
    contactDetailsRef?.current?.resetForm();
    socialMediaDetailsRef?.current?.resetForm();
    healthAndOtherDetailsRef?.current?.resetForm();

    setEmployee(initialEmployee);
    setIsUnsavedChangesModalOpen(false);
    setIsUnsavedModalDiscardButtonClicked(false);
    setIsCancelChangesModalOpen(false);
    setIsCancelModalConfirmButtonClicked(false);
  };

  const handleCancel = () => {
    setIsCancelChangesModalOpen(true);
  };

  useEffect(() => {
    if (isUnsavedModalSaveButtonClicked) {
      onSave();
    } else if (isUnsavedModalDiscardButtonClicked) {
      onCancel();
    }
  }, [isUnsavedModalDiscardButtonClicked, isUnsavedModalSaveButtonClicked]);

  useEffect(() => {
    if (isCancelModalConfirmButtonClicked) {
      onCancel();
    }
  }, [isCancelModalConfirmButtonClicked]);

  return (
    <Box role="region" aria-labelledby="page-title subtitle-next-to-title">
      <GeneralDetailsSection
        ref={generalDetailsRef}
        isAddFlow={isAddFlow}
        isAdmin={isUpdate}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <ContactDetailsSection
        ref={contactDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <FamilyDetailsSection
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <EducationalDetailsSection
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <SocialMediaDetailsSection
        ref={socialMediaDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <HealthAndOtherDetailsSection
        ref={healthAndOtherDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />

      {!isTerminatedEmployee &&
        (isAddFlow ? (
          <AddSectionButtonWrapper onNextClick={onSave} />
        ) : (
          <EditSectionButtonWrapper
            onCancelClick={handleCancel}
            onSaveClick={onSave}
          />
        ))}
    </Box>
  );
};

export default PersonalDetailsForm;
