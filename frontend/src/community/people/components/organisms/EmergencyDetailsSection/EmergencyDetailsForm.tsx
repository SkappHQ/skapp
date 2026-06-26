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
import PrimaryContactDetailsSection from "./SubSections/PrimaryContactDetailsSection";
import SecondaryContactDetailsSection from "./SubSections/SecondaryContactDetailsSection";

interface Props {
  isAddFlow?: boolean;
  isReadOnly?: boolean;
}

const EmergencyDetailsForm = ({
  isAddFlow = false,
  isReadOnly = false
}: Props) => {
  const primaryContactDetailsRef = useRef<FormMethods | null>(null);
  const secondaryContactDetailsRef = useRef<FormMethods | null>(null);
  const {
    nextStep,
    initialEmployee,
    currentStep,
    employee,
    isUnsavedModalSaveButtonClicked,
    isUnsavedModalDiscardButtonClicked,
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
    const primaryContactDetailsErrors =
      await primaryContactDetailsRef?.current?.validateForm();
    const secondaryContactDetailsErrors =
      await secondaryContactDetailsRef?.current?.validateForm();

    const primaryContactDetailsIsValid =
      primaryContactDetailsErrors &&
      Object.keys(primaryContactDetailsErrors).length === 0;

    const secondaryContactDetailsIsValid =
      secondaryContactDetailsErrors &&
      Object.keys(secondaryContactDetailsErrors).length === 0;

    if (primaryContactDetailsIsValid && secondaryContactDetailsIsValid) {
      primaryContactDetailsRef?.current?.submitForm();
      secondaryContactDetailsRef?.current?.submitForm();
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
    primaryContactDetailsRef?.current?.resetForm();
    secondaryContactDetailsRef?.current?.resetForm();

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
      <PrimaryContactDetailsSection
        ref={primaryContactDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <SecondaryContactDetailsSection
        ref={secondaryContactDetailsRef}
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

export default EmergencyDetailsForm;
