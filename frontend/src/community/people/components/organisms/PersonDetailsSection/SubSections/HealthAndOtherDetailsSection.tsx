import { Grid2 as Grid, type SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import { BloodGroupTypes } from "~community/people/enums/PeopleEnums";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { L3HealthAndOtherDetailsType } from "~community/people/types/PeopleTypes";
import { BloodGroupList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeHealthAndOtherDetailsValidation } from "~community/people/utils/peopleValidations";

interface props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const HealthAndOtherDetailsSection = forwardRef<FormMethods, props>(
  (props, ref) => {
    const { isInputsDisabled, isReadOnly = false } = props;
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "health&OtherDetails"
    );
    const translateAria = useTranslator(
      "peopleAria",
      "addResource",
      "healthAndOtherDetails"
    );

    const { employee, setPersonalDetails } = usePeopleStore((state) => state);

    const initialValues = useMemo<L3HealthAndOtherDetailsType>(
      () => employee?.personal?.healthAndOther as L3HealthAndOtherDetailsType,
      [employee]
    );

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

    const formik = useFormik({
      initialValues,
      validationSchema: employeeHealthAndOtherDetailsValidation,
      onSubmit: () => {},
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const { values, errors, handleChange, setFieldError, setFieldValue } =
      formik;

    const handleInput = async (e: SelectChangeEvent) => {
      const { name, value } = e.target;

      if (
        (name === "allergies" || name === "dietaryRestrictions") &&
        !isValidNamePattern(value)
      ) {
        return;
      }

      await setFieldValue(name, value);
      setFieldError(name, "");

      setPersonalDetails({
        general: employee?.personal?.general,
        healthAndOther: {
          ...employee?.personal?.healthAndOther,
          [name]: name === "bloodGroup" ? (value as BloodGroupTypes) : value
        }
      });
    };

    return (
      <PeopleLayout
        title={translateText(["title"])}
        containerStyles={{
          padding: "0",
          margin: "0 auto",
          height: "auto"
        }}
        dividerStyles={{
          mt: "0.5rem"
        }}
        pageHead={translateText(["head"])}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            spacing={2}
            sx={{
              mb: "2rem"
            }}
          >
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="bloodGroup"
                label={translateText(["bloodGroup"])}
                value={values?.bloodGroup ?? ""}
                placeholder={translateText(["selectBloodGroup"])}
                onChange={handleChange}
                onInput={handleInput}
                error={errors.bloodGroup ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={BloodGroupList}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
                ariaLabel={translateAria(["selectBloodGroup"])}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["allergies"])}
                inputType="text"
                value={values?.allergies ?? ""}
                placeHolder={translateText(["enterAllergies"])}
                onChange={handleInput}
                inputName="allergies"
                error={errors.allergies ?? ""}
                componentStyle={{
                  flex: 1
                }}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["dietaryRestrictions"])}
                inputType="text"
                value={values?.dietaryRestrictions ?? ""}
                placeHolder={translateText(["enterDietaryRestrictions"])}
                onChange={handleInput}
                inputName="dietaryRestrictions"
                error={errors.dietaryRestrictions ?? ""}
                componentStyle={{
                  flex: 1
                }}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["tShirtSize"])}
                inputType="text"
                value={values?.tShirtSize ?? ""}
                placeHolder={translateText(["enterTShirtSize"])}
                onChange={handleInput}
                inputName="tShirtSize"
                error={errors.tShirtSize ?? ""}
                componentStyle={{
                  flex: 1
                }}
                tooltip={translateText(["tShirtSizeTooltip"])}
                isDisabled={isInputsDisabled}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
                readOnly={isReadOnly}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleLayout>
    );
  }
);

HealthAndOtherDetailsSection.displayName = "HealthAndOtherDetailsSection";

export default HealthAndOtherDetailsSection;
