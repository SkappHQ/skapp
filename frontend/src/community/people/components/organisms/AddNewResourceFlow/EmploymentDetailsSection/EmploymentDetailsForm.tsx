import { Stack, type Theme, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { employmentDetailsFormTestId } from "~community/common/constants/testIds";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  scrollToFirstError,
  scrollToTop
} from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";
import { handleAddNewResourceSuccess } from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/addNewResourceUtils";

import CareerProgressionDetailsSection from "./CareerProgressionDetailsSection";
import EmploymentDetailsSection from "./EmploymentDetailsSection";
import IdentificationDetailsSection from "./IdentificationDetailsSection";
import PreviousEmploymentDetailsSection from "./PreviousEmploymentDetailsSection";
import VisaDetailsSection from "./VisaDetailsSection";

interface Props {
  onNext: () => void;
  onSave?: () => void;
  onBack: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  isUpdate?: boolean;
  isSubmitDisabled?: boolean;
  isProfileView?: boolean;
  updateEmployeeStatus?: EditAllInformationFormStatus;
  setUpdateEmployeeStatus?: Dispatch<
    SetStateAction<EditAllInformationFormStatus>
  >;
  isSuperAdminEditFlow?: boolean;
  isInputsDisabled?: boolean;
}

const EmploymentDetailsForm = ({
  onNext,
  onBack,
  isLoading,
  isSuccess,
  isUpdate = false,
  isSubmitDisabled = false,
  isProfileView = false,
  updateEmployeeStatus,
  setUpdateEmployeeStatus,
  isSuperAdminEditFlow = false,
  isInputsDisabled = false
}: Props) => {
  const theme: Theme = useTheme();

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const router = useRouter();

  const { setToastMessage } = useToast();

  const { resetEmployeeData, employeeDataChanges } = usePeopleStore(
    (state) => state
  );

  const [initialResetFlag, setInitialResetFlag] = useState(false);

  const employmentDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const identificationDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const handleNext = async () => {
    const employmentFormErrors =
      await employmentDetailsRef?.current?.validateForm();
    const identificationFormErrors =
      await identificationDetailsRef?.current?.validateForm();
    setTimeout(async () => {
      const employmentFormIsValid =
        Object?.keys(employmentFormErrors as any).length === 0;
      const identificationFormIsValid =
        Object.keys(identificationFormErrors as any).length === 0;
      if (employmentFormIsValid && identificationFormIsValid) {
        await employmentDetailsRef?.current?.submitForm();
        await identificationDetailsRef?.current?.submitForm();
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
        onNext();
      } else {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATE_ERROR);
        scrollToFirstError(theme);
      }
    }, 0);
  };

  useEffect(() => {
    if (isSuccess) {
      handleAddNewResourceSuccess({
        setToastMessage,
        resetEmployeeData,
        router,
        translateText
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    const resetForms = () => {
      employmentDetailsRef?.current?.resetForm();
      identificationDetailsRef?.current?.resetForm();
    };

    if (employeeDataChanges > 0) {
      resetForms();
    }
    if (employeeDataChanges === 0 && isSuperAdminEditFlow) {
      setInitialResetFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeDataChanges]);

  useEffect(() => {
    if (updateEmployeeStatus === EditAllInformationFormStatus.TRIGGERED) {
      void handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEmployeeStatus]);

  useEffect(() => {
    const validateInitialForms = async () => {
      await Promise.all([
        employmentDetailsRef?.current?.validateForm(),
        identificationDetailsRef?.current?.validateForm()
      ]);
    };
    if (isSuperAdminEditFlow && initialResetFlag) {
      void validateInitialForms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialResetFlag]);

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <PeopleLayout
      title={""}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        height: "auto",
      }}
      dividerStyles={{ mt: "0.5rem" }}
      pageHead={translateText(["head"])}
      showDivider={false}
    >
      <>
        <EmploymentDetailsSection
          ref={employmentDetailsRef as any}
          isUpdate={isUpdate}
          isProfileView={isProfileView}
          isInputsDisabled={isInputsDisabled}
        />
        <CareerProgressionDetailsSection
          isProfileView={isProfileView}
          isInputsDisabled={isInputsDisabled}
        />
        <IdentificationDetailsSection
          ref={identificationDetailsRef as any}
          isInputsDisabled={isInputsDisabled}
        />
        <PreviousEmploymentDetailsSection isInputsDisabled={isInputsDisabled} />
        <VisaDetailsSection isInputsDisabled={isInputsDisabled} />
        {!isInputsDisabled && (
          <Stack
            direction="row"
            justifyContent="flex-start"
            spacing={2}
            sx={{ padding: "1rem 0" }}
          >
            <Button
              label={
                isUpdate ? translateText(["cancel"]) : translateText(["back"])
              }
              buttonStyle={ButtonStyle.TERTIARY}
              startIcon={isUpdate ? <></> : IconName.LEFT_ARROW_ICON}
              endIcon={isUpdate ? IconName.CLOSE_ICON : <></>}
              isFullWidth={false}
              onClick={onBack}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              dataTestId={
                isUpdate
                  ? employmentDetailsFormTestId.buttons.cancelBtn
                  : employmentDetailsFormTestId.buttons.backBtn
              }
            />
            <Button
              label={
                isUpdate
                  ? translateText(["saveDetails"])
                  : translateText(["next"])
              }
              buttonStyle={ButtonStyle.PRIMARY}
              endIcon={
                isUpdate ? IconName.SAVE_ICON : IconName.RIGHT_ARROW_ICON
              }
              isFullWidth={false}
              onClick={handleNext}
              isLoading={isLoading}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              dataTestId={
                isUpdate
                  ? employmentDetailsFormTestId.buttons.saveDetailsBtn
                  : employmentDetailsFormTestId.buttons.nextBtn
              }
            />
          </Stack>
        )}
      </>
    </PeopleLayout>
  );
};

export default EmploymentDetailsForm;
