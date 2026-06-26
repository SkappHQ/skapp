import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidNamePattern } from "~community/common/utils/validation";
import { usePeopleStore } from "~community/people/store/store";
import { L3EducationalDetailsType } from "~community/people/types/PeopleTypes";
import { employeeEducationalDetailsValidation } from "~community/people/utils/peopleValidations";

const useEducationalDetailsFormHandlers = () => {
  const [rowEdited, setRowEdited] = useState(-1);
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );

  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const initialValues = useMemo<L3EducationalDetailsType>(() => {
    const emptyInitialValues: L3EducationalDetailsType = {
      institutionName: "",
      degree: "",
      major: "",
      startDate: "",
      endDate: ""
    };

    return {
      ...emptyInitialValues,
      ...(rowEdited > -1 && employee?.personal?.educational?.[rowEdited])
    };
  }, [employee?.personal?.educational, rowEdited]);

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "educationDetails"
  );

  const formik = useFormik({
    initialValues,
    validationSchema: employeeEducationalDetailsValidation(translateText),
    onSubmit: (values: L3EducationalDetailsType) => {
      if (rowEdited > -1) {
        const details = [...(employee?.personal?.educational || [])];
        details.splice(rowEdited, 1, {
          ...values,
          educationId: details[rowEdited]?.educationId ?? rowEdited
        });
        setPersonalDetails({
          general: employee?.personal?.general,
          educational: details
        });
        setRowEdited(-1);
      } else {
        const newEducationId =
          (employee?.personal?.educational?.length ?? 0) + 1;
        setPersonalDetails({
          general: employee?.personal?.general,
          educational: [
            ...(employee?.personal?.educational || []),
            { ...values, educationId: newEducationId }
          ]
        });
      }
      resetForm();
      setSelectedStartDate(undefined);
      setSelectedEndDate(undefined);
    },
    validateOnChange: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError
  } = formik;

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target) return;
      if (isValidNamePattern(event.target.value)) {
        setFieldValue(event.target.name, event.target.value);
        setFieldError(event.target.name, "");
      }
    },
    [setFieldError, setFieldValue]
  );

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    await setFieldValue(fieldName, newValue);
    setFieldError(fieldName, "");
  };

  const handleEdit = (rowIndex: number): void => {
    setRowEdited(rowIndex);
    const educationalDetail = employee?.personal?.educational?.[rowIndex] || {};
    const { institutionName, degree, major, startDate, endDate } =
      educationalDetail;

    setFieldValue("institutionName", institutionName);
    setFieldValue("degree", degree);
    setFieldValue("major", major);
    setFieldValue("startDate", startDate);
    setFieldValue("endDate", endDate);

    if (startDate) {
      setSelectedStartDate(DateTime.fromISO(startDate));
    } else {
      setSelectedStartDate(undefined);
    }

    if (endDate) {
      setSelectedEndDate(DateTime.fromISO(endDate));
    } else {
      setSelectedEndDate(undefined);
    }
  };

  const handleDelete = (rowIndex: number): void => {
    const updatedEducationalDetails = [
      ...(employee?.personal?.educational || [])
    ];
    updatedEducationalDetails.splice(rowIndex, 1);
    setPersonalDetails({
      general: employee?.personal?.general,
      educational: updatedEducationalDetails
    });
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const formatTableData = (data: L3EducationalDetailsType[]) => {
    if (!data?.length) return [];

    return data.map((detail) => {
      return {
        institutionName: detail?.institutionName,
        degree: detail?.degree,
        major: detail?.major,
        startDate: detail?.startDate?.split("T")[0],
        endDate: detail?.endDate?.split("T")[0]
      };
    });
  };

  return {
    rowEdited,
    setRowEdited,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    values,
    errors,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    handleInput,
    dateOnChange,
    handleEdit,
    handleDelete,
    formatTableData
  };
};

export default useEducationalDetailsFormHandlers;
