import { Grid2 as Grid, type SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { APP_FONT_FAMILY } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { numberPattern } from "~community/common/regex/regexPatterns";
import { usePeopleStore } from "~community/people/store/store";
import {
  EEOJobCategoryList,
  EthnicityList
} from "~community/people/utils/data/employeeSetupStaticData";
import { employeeIdentificationDetailsValidation } from "~community/people/utils/peopleValidations";

interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
}

interface props {
  isInputsDisabled?: boolean;
}

const IdentificationDetailsSection = forwardRef<FormMethods, props>(
  (props, ref) => {
    const { isInputsDisabled } = props;
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "divesityDetails"
    );
    const {
      employeeDataChanges,
      employeeIdentificationAndDiversityDetails,
      setEmployeeIdentificationAndDiversityDetails
    } = usePeopleStore((state) => state);

    const initialValues = useMemo(
      () => ({
        ssn: employeeIdentificationAndDiversityDetails?.ssn || "",
        ethnicity: employeeIdentificationAndDiversityDetails?.ethnicity || "",
        eeoJobCategory:
          employeeIdentificationAndDiversityDetails?.eeoJobCategory || ""
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [employeeDataChanges, employeeIdentificationAndDiversityDetails]
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
          setEmployeeIdentificationAndDiversityDetails(name, value);
        }
      } else {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmployeeIdentificationAndDiversityDetails(name, value);
      }
    };

    return (
      <PeopleLayout
        title={translateText(["title"])}
        containerStyles={{
          padding: "0",
          margin: "0 auto",
          fontFamily: APP_FONT_FAMILY
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
                value={values.ssn}
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
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="ethnicity"
                label={translateText(["ethnicity"])}
                value={values.ethnicity}
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
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="eeoJobCategory"
                label={translateText(["eeoJobCategory"])}
                value={values.eeoJobCategory}
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
              />
            </Grid>
          </Grid>
        </form>
      </PeopleLayout>
    );
  }
);

IdentificationDetailsSection.displayName = "IdentificationDetailsSection";

export default IdentificationDetailsSection;
