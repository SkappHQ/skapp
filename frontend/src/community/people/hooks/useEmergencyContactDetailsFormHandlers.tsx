import { SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import { ChangeEvent, useCallback, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";
import { RelationshipTypes } from "~community/people/enums/PeopleEnums";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import { usePeopleStore } from "~community/people/store/store";
import { L3EmergencyContactType } from "~community/people/types/PeopleTypes";
import { employeeEmergencyContactDetailsValidation } from "~community/people/utils/peopleValidations";

type EmergencyContactType =
  | "primaryEmergencyContact"
  | "secondaryEmergencyContact";

const useEmergencyContactDetailsFormHandlers = (
  contactType: EmergencyContactType
) => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "emergencyDetails"
  );

  const countryCode = useGetDefaultCountryCode();

  const { employee, setEmergencyDetails } = usePeopleStore((state) => state);

  const initialValues = useMemo<L3EmergencyContactType>(() => {
    const contact = employee?.emergency?.[contactType] || {};

    if (!contact.contactNo) {
      return {
        ...contact,
        countryCode,
        contactNo: ""
      };
    }

    const [extractedCountryCode, ...rest] = contact.contactNo.split(" ");

    return {
      ...contact,
      countryCode: extractedCountryCode || countryCode,
      contactNo: rest.join(" ")
    };
  }, [employee, countryCode, contactType]);

  const formik = useFormik({
    initialValues,
    validationSchema: employeeEmergencyContactDetailsValidation(translateText),
    onSubmit: () => {},
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { values, errors, handleChange, setFieldValue, setFieldError } = formik;

  const handleInput = useCallback(
    async (e: SelectChangeEvent) => {
      const { name, value } = e.target;

      if (name === "name" && isValidNamePattern(value)) {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmergencyDetails({
          [contactType]: {
            ...employee?.emergency?.[contactType],
            name: value
          }
        });
      } else if (name === "relationship") {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmergencyDetails({
          [contactType]: {
            ...employee?.emergency?.[contactType],
            relationship: value as RelationshipTypes
          }
        });
      }
    },
    [employee, setEmergencyDetails, setFieldError, setFieldValue, contactType]
  );

  const onChangeCountry = useCallback(
    async (countryCode: string): Promise<void> => {
      await setFieldValue("countryCode", countryCode);
      setFieldError("countryCode", "");
    },
    [setFieldError, setFieldValue]
  );

  const handlePhoneNumber = useCallback(
    async (contactNo: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const newContactNo = contactNo.target.value;
      await setFieldValue("contactNo", newContactNo);
      setFieldError("contactNo", "");
      setEmergencyDetails({
        [contactType]: {
          ...employee?.emergency?.[contactType],
          contactNo: `${values.countryCode} ${newContactNo}`
        }
      });
    },
    [
      values.countryCode,
      employee,
      setEmergencyDetails,
      setFieldError,
      setFieldValue,
      contactType
    ]
  );

  return {
    values,
    errors,
    handleChange,
    handleInput,
    onChangeCountry,
    handlePhoneNumber,
    formik
  };
};

export default useEmergencyContactDetailsFormHandlers;
