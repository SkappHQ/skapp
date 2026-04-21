import { Grid2 as Grid, SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import { forwardRef, useMemo } from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { numberPattern } from "~community/common/regex/regexPatterns";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { L3IdentificationAndDiversityDetailsType } from "~community/people/types/PeopleTypes";
import {
  EEOJobCategoryList,
  EthnicityList
} from "~community/people/utils/data/employeeSetupStaticData";
import { employeeIdentificationDetailsValidation } from "~community/people/utils/peopleValidations";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const IdentificationDetailsSection = forwardRef<FormMethods, Props>(
  ({ isInputsDisabled, isReadOnly = false }, ref) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "divesityDetails"
    );
    const translateAria = useTranslator(
      "peopleAria",
      "addResource",
      "diversityDetails"
    );

    const { employee, setEmploymentDetails } = usePeopleStore((state) => state);

    const initialValues = useMemo<L3IdentificationAndDiversityDetailsType>(
      () =>
        employee?.employment
          ?.identificationAndDiversityDetails as L3IdentificationAndDiversityDetailsType,
      [employee]
    );

    const formik = useFormik({
      initialValues,
      validationSchema: employeeIdentificationDetailsValidation(translateText),
      onSubmit: () => {},
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const { values, errors, handleChange, setFieldError, setFieldValue } =
      formik;

    const handleInput = async (e: SelectChangeEvent) => {
      const { name, value } = e.target;

      if (name === "ssn") {
        if (value === "" || numberPattern().test(value)) {
          await setFieldValue(name, value);
          setFieldError(name, "");
          setEmploymentDetails({
            ...employee?.employment,
            identificationAndDiversityDetails: {
              ...employee?.employment?.identificationAndDiversityDetails,
              [name]: value
            }
          });
        }
      } else {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmploymentDetails({
          ...employee?.employment,
          identificationAndDiversityDetails: {
            ...employee?.employment?.identificationAndDiversityDetails,
            [name]: value
          }
        });
      }
    };

    return (
      <PeopleFormSectionWrapper
        title={translateText(["title"])}
        containerStyles={{
          padding: "0",
          margin: "0 auto",
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
                label={translateText(["SSN"])}
                inputType="text"
                value={values?.ssn ?? ""}
                placeHolder={translateText(["enterSSN"])}
                onChange={handleInput}
                inputName="ssn"
                error={errors.ssn ?? ""}
                maxLength={11}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="ethnicity"
                label={translateText(["ethnicity"])}
                value={values?.ethnicity ?? ""}
                placeholder={translateText(["selectEthnicity"])}
                onChange={handleChange}
                onInput={handleInput}
                error={errors.ethnicity ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={EthnicityList}
                checkSelected
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
                ariaLabel={translateAria(["selectEthnicity"])}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="eeoJobCategory"
                label={translateText(["eeoJobCategory"])}
                value={values?.eeoJobCategory ?? ""}
                placeholder={translateText(["selectEEOJobCategory"])}
                onChange={handleChange}
                onInput={handleInput}
                error={errors.eeoJobCategory ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                checkSelected
                errorFocusOutlineNeeded={false}
                itemList={EEOJobCategoryList}
                tooltip={translateText(["eeoTooltip"])}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
                ariaLabel={translateAria(["selectEEOJobCategory"])}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleFormSectionWrapper>
    );
  }
);

IdentificationDetailsSection.displayName = "IdentificationDetailsSection";

export default IdentificationDetailsSection;
