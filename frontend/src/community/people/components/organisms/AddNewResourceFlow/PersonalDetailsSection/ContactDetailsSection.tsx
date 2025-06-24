import { Grid2 as Grid } from "@mui/material";
import { useFormik } from "formik";
import {
  ChangeEvent,
  SyntheticEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo
} from "react";

import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidAlphaNumericString } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import {
  isValidAlphaNumericNamePattern,
  isValidEmailPattern
} from "~community/common/utils/validation";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import { usePeopleStore } from "~community/people/store/store";
import { employeeContactDetailsValidation } from "~community/people/utils/peopleValidations";

interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
}

interface props {
  isInputsDisabled: boolean;
}

const ContactDetailsSection = forwardRef<FormMethods, props>((props, ref) => {
  const { isInputsDisabled } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "contactDetails"
  );
  const {
    employeeContactDetails,
    setEmployeeContactDetails,
    employeeDataChanges
  } = usePeopleStore((state) => state);
  const countryCode = useGetDefaultCountryCode();

  const initialValues = useMemo(
    () => ({
      personalEmail: employeeContactDetails?.personalEmail || "",
      countryCode: employeeContactDetails?.countryCode || "",
      phone: employeeContactDetails?.phone || "",
      addressLine1: employeeContactDetails?.addressLine1 || "",
      addressLine2: employeeContactDetails?.addressLine2 || "",
      city: employeeContactDetails?.city || "",
      country: employeeContactDetails?.country || "",
      state: employeeContactDetails?.state || "",
      postalCode: employeeContactDetails?.postalCode || ""
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeDataChanges]
  );

  const countryList = useGetCountryList();
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
    validationSchema: employeeContactDetailsValidation(translateText),
    onSubmit: () => {},
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { values, errors, setFieldValue, setFieldError } = formik;

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (
      name === "personalEmail" &&
      (value === "" || isValidEmailPattern(value))
    ) {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setEmployeeContactDetails(name, value);
    } else if (
      ["addressLine1", "addressLine2", "state", "city"].includes(name) &&
      (value === "" || isValidAlphaNumericNamePattern(value))
    ) {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setEmployeeContactDetails(name, value);
    } else if (
      name === "postalCode" &&
      (value === "" || isValidAlphaNumericString().test(value))
    ) {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setEmployeeContactDetails(name, value);
    }
  };

  const handleCountrySelect = async (
    e: SyntheticEvent,
    value: DropdownListType
  ): Promise<void> => {
    setFieldError("country", "");
    await setFieldValue("country", value.value);
    setEmployeeContactDetails("country", value.value);
    await setFieldValue("state", "");
    setEmployeeContactDetails("state", "");
  };

  const onChangeCountry = async (countryCode: string): Promise<void> => {
    setEmployeeContactDetails("countryCode", countryCode);
  };

  const handlePhoneNumber = async (
    phone: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    await setFieldValue("phone", phone.target.value);
    setFieldError("phone", "");
    setEmployeeContactDetails("phone", phone.target.value);
    if (!employeeContactDetails?.countryCode) {
      setFieldValue("countryCode", countryCode);
      setEmployeeContactDetails("countryCode", countryCode);
    }
  };

  useEffect(() => {
    if (!employeeContactDetails?.countryCode)
      setFieldValue("countryCode", countryCode);
  }, [countryCode, employeeContactDetails?.countryCode, setFieldValue]);
  return (
    <PeopleLayout
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        overflowY: "unset",
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
              value={values.personalEmail}
              placeHolder={translateText(["enterPersonalEmail"])}
              onInput={handleInput}
              inputName="personalEmail"
              error={errors.personalEmail ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputPhoneNumber
              label={translateText(["contactNo"])}
              value={values.phone}
              countryCodeValue={values.countryCode}
              onChangeCountry={onChangeCountry}
              onChange={handlePhoneNumber}
              error={errors.phone ?? ""}
              inputName="phone"
              fullComponentStyle={{
                mt: "0rem"
              }}
              placeHolder={translateText(["enterContactNo"])}
              isDisabled={isInputsDisabled}
              readOnly={isInputsDisabled}
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
              value={values.addressLine1}
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
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["addressLine2"])}
              inputType="text"
              value={values.addressLine2}
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
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["city"])}
              inputType="text"
              value={values.city}
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
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <DropdownAutocomplete
              itemList={countryList}
              inputName="country"
              label={translateText(["country"])}
              value={
                values.country
                  ? {
                      label: values.country,
                      value: values.country
                    }
                  : undefined
              }
              placeholder={translateText(["selectCountry"])}
              onChange={handleCountrySelect}
              error={errors.country ?? ""}
              componentStyle={{
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              readOnly={isInputsDisabled}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["state"])}
              inputType="text"
              value={values.state}
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
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["postalCode"])}
              inputType="text"
              value={values.postalCode}
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
            />
          </Grid>
        </Grid>
      </form>
    </PeopleLayout>
  );
});

ContactDetailsSection.displayName = "ContactDetailsSection";

export default ContactDetailsSection;
