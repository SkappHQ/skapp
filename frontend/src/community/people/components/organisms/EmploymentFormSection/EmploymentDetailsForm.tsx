import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import { appModes } from "~community/common/constants/configs";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { scrollToFirstError } from "~community/common/utils/commonUtil";
import { useCheckEmailAndIdentificationNo } from "~community/people/api/PeopleApi";
import { AccountStatusTypes } from "~community/people/enums/PeopleEnums";
import useStepper from "~community/people/hooks/useStepper";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { useHandlePeopleEdit } from "~community/people/utils/peopleEditFlowUtils/useHandlePeopleEdit";
import { LoginMethodsEnums } from "~enterprise/common/enums/Common";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";

import AddSectionButtonWrapper from "../../molecules/AddSectionButtonWrapper/AddSectionButtonWrapper";
import EditSectionButtonWrapper from "../../molecules/EditSectionButtonWrapper/EditSectionButtonWrapper";
import ReinviteConfirmationModal from "../../molecules/ReinviteConfirmationModal/ReinviteConfirmationModal";
import CareerProgressDetailsSection from "./SubSections/CareerProgressDetailsSection";
import EmploymentDetailsSection from "./SubSections/EmploymentDetailsSection";
import IdentificationDetailsSection from "./SubSections/IdentificationDetailsSection";
import PreviousEmploymentDetailsSection from "./SubSections/PreviousEmploymentDetailsSection";
import VisaDetailsSection from "./SubSections/VisaDetailsSection";

interface Props {
  isAddFlow?: boolean;
  isUpdate?: boolean;
  isProfileView?: boolean;
  isReadOnly?: boolean;
}

const EmploymentDetailsForm = ({
  isAddFlow = false,
  isUpdate = false,
  isProfileView = false,
  isReadOnly = false
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
    isReinviteConfirmationModalOpen,
    isCancelModalConfirmButtonClicked,
    setCurrentStep,
    setNextStep,
    setEmployee,
    setIsUnsavedChangesModalOpen,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setIsReinviteConfirmationModalOpen,
    setEmploymentDetails,
    setIsCancelChangesModalOpen,
    setIsCancelModalConfirmButtonClicked
  } = usePeopleStore((state) => state);

  const { handleMutate } = useHandlePeopleEdit();

  const translateText = useTranslator("peopleModule");

  const { handleNext } = useStepper();

  const env = useGetEnvironment();
  const isEnterpriseMode = env === appModes.ENTERPRISE;

  const { tenantID } = useSessionData();

  const { data: globalLogin } = useGetGlobalLoginMethod(
    isEnterpriseMode,
    tenantID as string
  );

  const email = employee?.employment?.employmentDetails?.email || "";
  const employeeNumber =
    employee?.employment?.employmentDetails?.employeeNumber || "";

  const { data: emailValidation } = useCheckEmailAndIdentificationNo(
    email,
    employeeNumber
  );

  const isTerminatedEmployee =
    employee?.common?.accountStatus === AccountStatusTypes.TERMINATED;

  const validateGoogleDomain = (): boolean => {
    if (
      isEnterpriseMode &&
      email &&
      globalLogin === LoginMethodsEnums.GOOGLE.toString() &&
      emailValidation &&
      !emailValidation.isGoogleDomain
    ) {
      employmentDetailsRef.current?.setFieldError?.(
        "email",
        translateText(["addResource", "generalDetails", "workEmailGoogle"])
      );
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validateGoogleDomain()) {
      return;
    }

    const employmentFormErrors =
      (await employmentDetailsRef?.current?.validateForm()) || {};
    const identificationFormErrors =
      (await identificationDetailsRef?.current?.validateForm()) || {};

    if (
      employee?.employment?.employmentDetails?.email !==
        initialEmployee?.employment?.employmentDetails?.email &&
      !isReinviteConfirmationModalOpen &&
      !isAddFlow &&
      !employmentFormErrors?.email
    ) {
      setIsReinviteConfirmationModalOpen(true);
      return;
    }

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
      setEmployee(employee);
    } else {
      setIsReinviteConfirmationModalOpen(false);
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
      <EmploymentDetailsSection
        ref={employmentDetailsRef}
        isUpdate={isUpdate}
        isProfileView={isProfileView}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <CareerProgressDetailsSection
        isProfileView={isProfileView}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <IdentificationDetailsSection
        ref={identificationDetailsRef}
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <PreviousEmploymentDetailsSection
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />
      <VisaDetailsSection
        isInputsDisabled={isTerminatedEmployee}
        isReadOnly={isReadOnly}
      />

      <ReinviteConfirmationModal
        onCancel={() => {
          setIsReinviteConfirmationModalOpen(false);

          setEmploymentDetails({
            employmentDetails: {
              ...employee?.employment?.employmentDetails,
              email: initialEmployee?.employment?.employmentDetails?.email
            }
          });
        }}
        onClick={onSave}
        title={translateText([
          "peoples",
          "workEmailChangingReinvitationConfirmationModalTitle"
        ])}
        description={translateText([
          "peoples",
          "workEmailChangingReinvitationConfirmationModalDescription"
        ])}
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

export default EmploymentDetailsForm;
