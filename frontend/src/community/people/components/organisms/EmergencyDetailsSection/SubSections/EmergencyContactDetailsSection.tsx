import { SelectChangeEvent } from "@mui/material";
import { FormikErrors, FormikProps } from "formik";
import { ChangeEvent, forwardRef, useImperativeHandle } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { L3EmergencyContactType } from "~community/people/types/PeopleTypes";

import ContactDetailsFormSection from "./ContactDetailsFormSection";

interface Props {
  isReadOnly?: boolean;
  isInputsDisabled?: boolean;
  titleKey: string;
  formHandlersHook: () => {
    values: L3EmergencyContactType;
    errors: FormikErrors<L3EmergencyContactType>;
    handleChange: (e: SelectChangeEvent) => void;
    handleInput: (e: SelectChangeEvent) => void;
    onChangeCountry: (value: string) => Promise<void>;
    handlePhoneNumber: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    formik: FormikProps<L3EmergencyContactType>;
  };
}

const EmergencyContactDetailsSection = forwardRef<FormMethods, Props>(
  (
    {
      isReadOnly = false,
      isInputsDisabled = false,
      titleKey,
      formHandlersHook
    }: Props,
    ref
  ) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "emergencyDetails"
    );
    const translateAria = useTranslator(
      "peopleAria",
      "addResource",
      "emergencyDetails"
    );

    const {
      values,
      errors,
      handleChange,
      handleInput,
      onChangeCountry,
      handlePhoneNumber,
      formik
    } = formHandlersHook();

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const validationErrors = await formik.validateForm();
        return validationErrors;
      },
      submitForm: async () => {
        await formik.submitForm();
      },
      resetForm: () => {
        formik.resetForm();
      }
    }));

    return (
      <ContactDetailsFormSection
        title={titleKey}
        pageHead={translateText(["head"])}
        translateText={translateText}
        translateAria={translateAria}
        values={values}
        errors={errors}
        handleChange={handleChange}
        handleInput={handleInput}
        onChangeCountry={onChangeCountry}
        handlePhoneNumber={handlePhoneNumber}
        formik={formik}
        isReadOnly={isReadOnly}
        isInputsDisabled={isInputsDisabled}
      />
    );
  }
);

EmergencyContactDetailsSection.displayName = "EmergencyContactDetailsSection";

export default EmergencyContactDetailsSection;
