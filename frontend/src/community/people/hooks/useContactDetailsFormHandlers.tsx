import { FormikProps } from "formik";
import { ChangeEvent, SyntheticEvent } from "react";

import { isValidAlphaNumericString } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { isValidAlphaNumericNamePattern } from "~community/common/utils/validation";
import { usePeopleStore } from "~community/people/store/store";
import { L3ContactDetailsType } from "~community/people/types/PeopleTypes";

interface Props {
  formik: FormikProps<L3ContactDetailsType>;
}

const useContactDetailsFormHandlers = ({ formik }: Props) => {
  const { employee, setPersonalDetails } = usePeopleStore((state) => state);
  const { setFieldValue, setFieldError, values } = formik;

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let isValid = false;

    if (name === "personalEmail") {
      isValid = true;
    } else if (["addressLine1", "addressLine2"].includes(name)) {
      isValid = value === "" || isValidAlphaNumericNamePattern(value);
    } else if (["state", "city"].includes(name)) {
      isValid = true;
    } else if (name === "postalCode") {
      isValid = value === "" || isValidAlphaNumericString().test(value);
    }

    if (isValid) {
      await setFieldValue(name, value);
      setFieldError(name, "");

      setPersonalDetails({
        general: employee?.personal?.general,
        contact: {
          ...employee?.personal?.contact,
          [name]: value
        }
      });
    }
  };

  const handleCountrySelect = async (
    e: SyntheticEvent,
    value: DropdownListType
  ): Promise<void> => {
    setFieldError("country", "");
    await setFieldValue("country", value.value);
    setPersonalDetails({
      general: employee?.personal?.general,
      contact: {
        ...employee?.personal?.contact,
        country: value.value as string
      }
    });
  };

  const onChangeCountry = async (countryCode: string): Promise<void> => {
    await setFieldValue("countryCode", countryCode);
  };

  const onChangePhoneNumber = async (e: ChangeEvent<HTMLInputElement>) => {
    const contactNo = e.target.value;
    await setFieldValue("contactNo", contactNo);
    setPersonalDetails({
      general: employee?.personal?.general,
      contact: {
        ...employee?.personal?.contact,
        contactNo: `${values.countryCode} ${contactNo}`
      }
    });
  };

  return {
    handleInput,
    handleCountrySelect,
    onChangeCountry,
    onChangePhoneNumber
  };
};

export default useContactDetailsFormHandlers;
