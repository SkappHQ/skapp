import { SelectChangeEvent } from "@mui/material";
import { FormikProps } from "formik";
import { DateTime } from "luxon";
import { SyntheticEvent, useEffect, useState } from "react";

import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { isValidAlphaNumericName } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { NationalityEnum } from "~community/people/enums/PeopleEnums";
import { usePeopleStore } from "~community/people/store/store";
import { L3GeneralDetailsType } from "~community/people/types/PeopleTypes";

interface Props {
  formik: FormikProps<L3GeneralDetailsType>;
}

const useGeneralDetailsFormHandlers = ({ formik }: Props) => {
  const { values, setFieldValue, setFieldError } = formik;
  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const [age, setAge] = useState<number | string>(0);
  const [selectedDob, setSelectedDob] = useState<DateTime | undefined>(
    undefined
  );

  useEffect(() => {
    if (!values.dateOfBirth) {
      setAge("-");
      setSelectedDob(undefined);
      return;
    }

    try {
      const birthDate = new Date(values.dateOfBirth);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      setAge(calculatedAge);
      setSelectedDob(DateTime.fromJSDate(new Date(values.dateOfBirth)));
    } catch (error) {
      setAge("-");
      setSelectedDob(undefined);
    }
  }, [values.dateOfBirth]);

  const handleChange = async (e: SelectChangeEvent) => {
    const { name, value } = e.target;

    const isValid =
      name === "firstName" ||
      name === "middleName" ||
      name === "lastName" ||
      ((name === "passportNumber" || name === "nin") &&
        (value === "" || isValidAlphaNumericName().test(value))) ||
      ![
        "firstName",
        "middleName",
        "lastName",
        "passportNumber",
        "nin"
      ].includes(name);

    if (isValid) {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setPersonalDetails({
        general: {
          ...employee?.personal?.general,
          [name]: value
        }
      });
    }
  };

  const handleNationalitySelect = async (
    _e: SyntheticEvent<Element, Event>,
    value: DropdownListType
  ): Promise<void> => {
    await setFieldValue("nationality", value.value);
    setPersonalDetails({
      general: {
        ...employee?.personal?.general,
        nationality: value.value as NationalityEnum
      }
    });
  };

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    if (fieldName && newValue) {
      const dateValue = newValue?.split("T")?.[0] ?? "";
      if (dateValue !== undefined) {
        await setFieldValue(fieldName, dateValue);
        setPersonalDetails({
          general: {
            ...employee?.personal?.general,
            dateOfBirth: dateValue
          }
        });
      }

      setFieldError(fieldName, "");
    }
  };

  const handleDateChange = (newValue: string | null) => {
    if (newValue) {
      dateOnChange(
        "birthDate",
        (convertDateToFormat(
          new Date(newValue as string),
          LONG_DATE_TIME_FORMAT
        ) as string) ?? ""
      );
    }
  };

  return {
    handleChange,
    handleNationalitySelect,
    dateOnChange,
    handleDateChange,
    age,
    selectedDob,
    setSelectedDob
  };
};

export default useGeneralDetailsFormHandlers;
