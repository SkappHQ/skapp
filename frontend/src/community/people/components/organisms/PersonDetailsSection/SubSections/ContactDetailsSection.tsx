import { Grid2 as Grid } from "@mui/material";
import { useFormik } from "formik";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import useContactDetailsFormHandlers from "~community/people/hooks/useContactDetailsFormHandlers";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { L3ContactDetailsType } from "~community/people/types/PeopleTypes";
import { employeeContactDetailsValidation } from "~community/people/utils/peopleValidations";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const ContactDetailsSection = forwardRef<FormMethods, Props>((props, ref) => {
  const { isInputsDisabled, isReadOnly = false } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "contactDetails"
  );
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "contactDetails"
  );

  const countryCode = useGetDefaultCountryCode();

  const { employee } = usePeopleStore((state) => state);

  const initialValues = useMemo<L3ContactDetailsType>(() => {
    const personalContact = employee?.personal?.contact || {};

    if (!personalContact.contactNo) {
      return {
        ...personalContact,
        countryCode,
        contactNo: ""
      };
    }

    const [extractedCountryCode, ...rest] =
      personalContact.contactNo.split(" ");

    return {
      ...personalContact,
      countryCode: extractedCountryCode || countryCode,
      contactNo: rest.join(" ")
    };
  }, [employee, countryCode]);

  const countryList = useGetCountryList();

  const formik = useFormik({
    initialValues,
    validationSchema: employeeContactDetailsValidation(translateText),
    onSubmit: () => {},
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const {
    handleInput,
    handleCountrySelect,
    onChangeCountry,
    onChangePhoneNumber
  } = useContactDetailsFormHandlers({ formik });

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

  const { values, errors } = formik;

  return (
    <PeopleFormSectionWrapper
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        overflowY: "unset",
        height: "auto",
        fontFamily: "Poppins, sans-serif"
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
            <InputField
              label={translateText(["personalEmail"])}
              inputType="email"
              value={values?.personalEmail ?? ""}
              placeHolder={translateText(["enterPersonalEmail"])}
              onInput={handleInput}
              inputName="personalEmail"
              error={errors.personalEmail ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputPhoneNumber
              label={translateText(["contactNo"])}
              value={values?.contactNo ?? ""}
              countryCodeValue={values?.countryCode ?? ""}
              onChangeCountry={onChangeCountry}
              onChange={onChangePhoneNumber}
              error={errors.contactNo ?? ""}
              inputName="contactNo"
              fullComponentStyle={{
                mt: "0rem"
              }}
              placeHolder={translateText(["enterContactNo"])}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
              ariaLabel={translateAria(["contactNumber"])}
            />
          </Grid>
          <Grid
            size={{ xl: 4 }}
            sx={{
              display: { xs: "none", xl: "block" }
            }}
          />

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["addressLine1"])}
              inputType="text"
              value={values?.addressLine1 ?? ""}
              placeHolder={translateText(["enterAddressLine1"])}
              onChange={handleInput}
              inputName="addressLine1"
              error={errors.addressLine1 ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["addressLine2"])}
              inputType="text"
              value={values?.addressLine2 ?? ""}
              placeHolder={translateText(["enterAddressLine2"])}
              onChange={handleInput}
              inputName="addressLine2"
              error={errors.addressLine2 ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["city"])}
              inputType="text"
              value={values?.city ?? ""}
              placeHolder={translateText(["enterCity"])}
              onChange={handleInput}
              inputName="city"
              error={errors.city ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <DropdownAutocomplete
              itemList={countryList}
              inputName="country"
              label={translateText(["country"])}
              value={
                values?.country
                  ? { label: values.country, value: values.country }
                  : undefined
              }
              placeholder={translateText(["selectCountry"])}
              onChange={handleCountrySelect}
              error={errors.country ?? ""}
              componentStyle={{ mt: "0rem" }}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["state"])}
              inputType="text"
              value={values?.state ?? ""}
              placeHolder={translateText(["enterState"])}
              onChange={handleInput}
              inputName="state"
              error={errors.state ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["postalCode"])}
              inputType="text"
              value={values?.postalCode}
              placeHolder={translateText(["enterPostalCode"])}
              onChange={handleInput}
              inputName="postalCode"
              error={errors.postalCode ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
              isDisabled={isInputsDisabled}
              readOnly={isReadOnly}
            />
          </Grid>
        </Grid>
      </form>
    </PeopleFormSectionWrapper>
  );
});

ContactDetailsSection.displayName = "GeneralDetailsSection";

export default ContactDetailsSection;
