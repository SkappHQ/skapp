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
import CareerProgressDetailsSection from "./SubSections/CareerProgressDetailsSection";
import EmploymentDetailsSection from "./SubSections/EmploymentDetailsSection";
import IdentificationDetailsSection from "./SubSections/IdentificationDetailsSection";
import PreviousEmploymentDetailsSection from "./SubSections/PreviousEmploymentDetailsSection";
import VisaDetailsSection from "./SubSections/VisaDetailsSection";

interface Props {
  isAddFlow?: boolean;
  isUpdate?: boolean;
  isProfileView?: boolean;
}

const EmploymentDetailsForm = ({
  isAddFlow = false,
  isUpdate = false,
  isProfileView = false
}: Props) => {
  const employmentDetailsRef = useRef<FormMethods | null>(null);
  const identificationDetailsRef = useRef<FormMethods | null>(null);

  const {
    nextStep,
    currentStep,
    employee,
    initialEmployee,
    isUnsavedModalSaveButtonClicked,
    isUnsavedModalDiscardButtonClicked,
    setCurrentStep,
    setNextStep,
    setEmployee,
    setIsUnsavedChangesModalOpen,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked
  } = usePeopleStore((state) => state);

  const { handleMutate } = useHandlePeopleEdit();

  const { handleNext } = useStepper();

  const isTerminatedEmployee =
    employee?.common?.accountStatus === AccountStatusTypes.TERMINATED;

  const onSave = async () => {
    const employmentFormErrors =
      (await employmentDetailsRef?.current?.validateForm()) || {};
    const identificationFormErrors =
      (await identificationDetailsRef?.current?.validateForm()) || {};

    const employmentFormIsValid =
      employmentFormErrors && Object.keys(employmentFormErrors).length === 0;
    const identificationFormIsValid =
      identificationFormErrors &&
      Object.keys(identificationFormErrors).length === 0;

    if (employmentFormIsValid && identificationFormIsValid) {
      employmentDetailsRef?.current?.submitForm();
      identificationDetailsRef?.current?.submitForm();
      if (isAddFlow) {
        handleNext();
      } else {
        setCurrentStep(nextStep);
        setIsUnsavedChangesModalOpen(false);
        setIsUnsavedModalSaveButtonClicked(false);

        handleMutate();
      }
    } else {
      setNextStep(currentStep);
      setIsUnsavedChangesModalOpen(false);
      scrollToFirstError(theme);
      setIsUnsavedModalSaveButtonClicked(false);
    }
  };

  const onCancel = () => {
    employmentDetailsRef?.current?.resetForm();
    identificationDetailsRef?.current?.resetForm();

    setEmployee(initialEmployee);
    setIsUnsavedChangesModalOpen(false);
    setIsUnsavedModalDiscardButtonClicked(false);
  };

  useEffect(() => {
    if (isUnsavedModalSaveButtonClicked) {
      onSave();
    } else if (isUnsavedModalDiscardButtonClicked) {
      onCancel();
    }
  }, [isUnsavedModalDiscardButtonClicked, isUnsavedModalSaveButtonClicked]);

  return (
    <>
      <EmploymentDetailsSection
        ref={employmentDetailsRef}
        isUpdate={isUpdate}
        isProfileView={isProfileView}
        isInputsDisabled={isTerminatedEmployee}
      />
      <CareerProgressDetailsSection
        isProfileView={isProfileView}
        isInputsDisabled={isTerminatedEmployee}
      />
      <IdentificationDetailsSection
        ref={identificationDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
      />
      <PreviousEmploymentDetailsSection
        isInputsDisabled={isTerminatedEmployee}
      />
      <VisaDetailsSection isInputsDisabled={isTerminatedEmployee} />

      {!isTerminatedEmployee &&
        (isAddFlow ? (
          <AddSectionButtonWrapper onNextClick={onSave} />
        ) : (
          <EditSectionButtonWrapper
            onCancelClick={onCancel}
            onSaveClick={onSave}
          />
        ))}
    </>
  );
};

export default EmploymentDetailsForm;
