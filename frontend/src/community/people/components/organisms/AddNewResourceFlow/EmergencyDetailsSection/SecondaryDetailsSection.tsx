import { Grid2 as Grid, type SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import {
  ChangeEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo
} from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import { usePeopleStore } from "~community/people/store/store";
import { EmergencyContactRelationshipList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeSecondaryEmergencyContactDetailsValidation } from "~community/people/utils/peopleValidations";

interface Props {
  isManager?: boolean;
  isInputsDisabled?: boolean;
}

interface RefCallback {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

const SecondaryDetailsSection = forwardRef<RefCallback, Props>(
  ({ isManager = false, isInputsDisabled = false }: Props, ref) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "emergencyDetails"
    );
    const {
      employeeDataChanges,
      employeeEmergencyContactDetails,
      setEmployeeSecondaryEmergencyContactDetails
    } = usePeopleStore((state) => state);
    const countryCode = useGetDefaultCountryCode();

    const initialValues = useMemo(
      () => ({
        name:
          employeeEmergencyContactDetails?.secondaryEmergencyContact?.name ||
          "",
        relationship:
          employeeEmergencyContactDetails?.secondaryEmergencyContact
            ?.relationship || "",
        phone:
          employeeEmergencyContactDetails?.secondaryEmergencyContact?.phone ||
          "",
        countryCode:
          employeeEmergencyContactDetails?.secondaryEmergencyContact
            ?.countryCode || ""
      }),
      [employeeDataChanges]
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
      validationSchema:
        employeeSecondaryEmergencyContactDetailsValidation(translateText),
      onSubmit: () => {},
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const { values, errors, handleChange, setFieldValue, setFieldError } =
      formik;

    const handleInput = async (e: SelectChangeEvent) => {
      if (e.target.name === "name" && isValidNamePattern(e.target.value)) {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeSecondaryEmergencyContactDetails(
          e.target.name,
          e.target.value
        );
      } else if (e.target.name === "relationship") {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeSecondaryEmergencyContactDetails(
          e.target.name,
          e.target.value
        );
      }
    };

    const onChangeCountry = async (countryCode: string): Promise<void> => {
      setEmployeeSecondaryEmergencyContactDetails("countryCode", countryCode);
    };

    const handlePhoneNumber = async (
      phone: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
      await setFieldValue("phone", phone.target.value);
      setFieldError("phone", "");
      setEmployeeSecondaryEmergencyContactDetails("phone", phone.target.value);
      if (
        !employeeEmergencyContactDetails?.secondaryEmergencyContact?.countryCode
      ) {
        setFieldValue("countryCode", countryCode);
        setEmployeeSecondaryEmergencyContactDetails("countryCode", countryCode);
      }
    };

    useEffect(() => {
      if (
        !employeeEmergencyContactDetails?.secondaryEmergencyContact?.countryCode
      )
        setFieldValue("countryCode", countryCode);
    }, [
      countryCode,
      employeeEmergencyContactDetails?.secondaryEmergencyContact?.countryCode,
      setFieldValue
    ]);
    return (
      <PeopleLayout
        title={translateText(["secondaryTitle"])}
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
              mb: "2.5rem"
            }}
          >
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["name"])}
                inputType="text"
                value={values.name}
                placeHolder={translateText(["enterName"])}
                onChange={handleChange}
                onInput={handleInput}
                inputName="name"
                error={errors.name ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                readOnly={isManager || isInputsDisabled}
                isDisabled={isInputsDisabled}
                maxLength={50}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="relationship"
                label={translateText(["relationship"])}
                value={values.relationship}
                placeholder={translateText(["selectRelationship"])}
                onChange={handleChange}
                onInput={handleInput}
                error={errors.relationship ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                checkSelected={true}
                itemList={EmergencyContactRelationshipList}
                readOnly={isManager || isInputsDisabled}
                isDisabled={isInputsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputPhoneNumber
                label={translateText(["contactNo"])}
                value={values.phone}
                countryCodeValue={values.countryCode}
                placeHolder={translateText(["enterContactNo"])}
                onChangeCountry={onChangeCountry}
                onChange={handlePhoneNumber}
                error={errors.phone ?? ""}
                inputName="phone"
                fullComponentStyle={{
                  mt: "0rem"
                }}
                readOnly={isManager || isInputsDisabled}
                isDisabled={isManager || isInputsDisabled}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleLayout>
    );
  }
);

SecondaryDetailsSection.displayName = "SecondaryDetailsSection";

export default SecondaryDetailsSection;
