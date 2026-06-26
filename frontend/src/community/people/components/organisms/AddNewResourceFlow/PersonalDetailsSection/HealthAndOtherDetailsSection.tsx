import { Grid2 as Grid, type SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import { forwardRef, useImperativeHandle } from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { BloodGroupList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeHealthAndOtherDetailsValidation } from "~community/people/utils/peopleValidations";

interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
}

interface props {
  isInputsDisabled?: boolean;
}

const HealthAndOtherDetailsSection = forwardRef<FormMethods, props>(
  (props, ref) => {
    const { isInputsDisabled } = props;
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "health&OtherDetails"
    );

    const { employeeHealthAndOtherDetails, setEmployeeHealthAndOtherDetails } =
      usePeopleStore((state) => state);

    const initialValues = {
      bloodGroup: employeeHealthAndOtherDetails?.bloodGroup || "",
      allergies: employeeHealthAndOtherDetails?.allergies || "",
      dietaryRestrictions:
        employeeHealthAndOtherDetails?.dietaryRestrictions || "",
      tshirtSize: employeeHealthAndOtherDetails?.tshirtSize || ""
    };

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
      if (
        (e.target.name === "allergies" ||
          e.target.name === "dietaryRestrictions") &&
        isValidNamePattern(e.target.value)
      ) {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeHealthAndOtherDetails(e.target.name, e.target.value);
      } else if (e.target.name === "tshirtSize") {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeHealthAndOtherDetails(e.target.name, e.target.value);
      } else if (e.target.name === "bloodGroup") {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeHealthAndOtherDetails(e.target.name, e.target.value);
      }
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
                value={values.bloodGroup}
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
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["allergies"])}
                inputType="text"
                value={values.allergies}
                placeHolder={translateText(["enterAllergies"])}
                onChange={handleInput}
                inputName="allergies"
                error={errors.allergies ?? ""}
                componentStyle={{
                  flex: 1
                }}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
                isDisabled={isInputsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["dietaryRestrictions"])}
                inputType="text"
                value={values.dietaryRestrictions}
                placeHolder={translateText(["enterDietaryRestrictions"])}
                onChange={handleInput}
                inputName="dietaryRestrictions"
                error={errors.dietaryRestrictions ?? ""}
                componentStyle={{
                  flex: 1
                }}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
                isDisabled={isInputsDisabled}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["tShirtSize"])}
                inputType="text"
                value={values.tshirtSize}
                placeHolder={translateText(["enterTShirtSize"])}
                onChange={handleInput}
                inputName="tshirtSize"
                error={errors.tshirtSize ?? ""}
                componentStyle={{
                  flex: 1
                }}
                tooltip={translateText(["tShirtSizeTooltip"])}
                isDisabled={isInputsDisabled}
                maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
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
