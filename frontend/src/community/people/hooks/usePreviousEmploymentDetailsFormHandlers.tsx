import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  isValidAlphaNumericNamePattern,
  isValidNamePattern
} from "~community/common/utils/validation";
import { usePeopleStore } from "~community/people/store/store";
import { L3PreviousEmploymentDetailsType } from "~community/people/types/PeopleTypes";
import { employeePreviousEmploymentDetailsValidation } from "~community/people/utils/peopleValidations";

const usePreviousEmploymentDetailsFormHandlers = () => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "previousEmploymentDetails"
  );

  const [rowEdited, setRowEdited] = useState(-1);
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );

  const { employee, setEmploymentDetails } = usePeopleStore((state) => state);

  const initialValues = useMemo<L3PreviousEmploymentDetailsType>(() => {
    const emptyInitialValues: L3PreviousEmploymentDetailsType = {
      employmentId: undefined,
      companyName: "",
      jobTitle: "",
      startDate: "",
      endDate: ""
    };

    return {
      ...emptyInitialValues,
      ...(rowEdited > -1 &&
        employee?.employment?.previousEmployment?.[rowEdited])
    };
  }, [employee?.employment?.previousEmployment, rowEdited]);

  const formik = useFormik({
    initialValues,
    validationSchema:
      employeePreviousEmploymentDetailsValidation(translateText),
    onSubmit: (values: L3PreviousEmploymentDetailsType) => {
      if (rowEdited > -1) {
        const employments = [
          ...(employee.employment?.previousEmployment || [])
        ];
        employments?.splice(rowEdited, 1, {
          ...values,
          employmentId: employments[rowEdited]?.employmentId ?? rowEdited
        });
        setEmploymentDetails({
          ...employee?.employment,
          previousEmployment: employments
        });
        setRowEdited(-1);
      } else {
        const newEmploymentId =
          (employee?.employment?.previousEmployment?.length ?? 0) + 1;
        setEmploymentDetails({
          ...employee?.employment,
          previousEmployment: [
            ...(employee?.employment?.previousEmployment || []),
            {
              ...values,
              employmentId: newEmploymentId
            }
          ]
        });
      }
      resetForm();
      setSelectedEndDate(undefined);
      setSelectedStartDate(undefined);
    },
    validateOnChange: false
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
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (
        (name === "companyName" && isValidAlphaNumericNamePattern(value)) ||
        (name === "jobTitle" && isValidNamePattern(value))
      ) {
        await setFieldValue(name, value);
        setFieldError(name, "");
      }
    },
    [setFieldError, setFieldValue]
  );

  const dateOnChange = useCallback(
    async (fieldName: string, newValue: string): Promise<void> => {
      await setFieldValue(fieldName, newValue);
      setFieldError(fieldName, "");
    },
    [setFieldError, setFieldValue]
  );

  useEffect(() => {
    if (values.startDate) {
      const employmentStartDate = DateTime.fromISO(values.startDate);
      setSelectedStartDate(employmentStartDate);
    } else {
      setSelectedStartDate(undefined);
    }
    if (values.endDate) {
      const employmentEndDate = DateTime.fromISO(values.endDate);
      setSelectedEndDate(employmentEndDate);
    } else {
      setSelectedEndDate(undefined);
    }
  }, [values]);

  const handleEdit = useCallback(
    (rowIndex: number) => {
      setRowEdited(rowIndex);
      const employment = employee?.employment?.previousEmployment?.[rowIndex];
      if (employment) {
        setFieldValue("companyName", employment.companyName ?? "");
        setFieldValue("jobTitle", employment.jobTitle ?? "");
        setFieldValue("startDate", employment.startDate ?? "");
        setFieldValue("endDate", employment.endDate ?? "");
      }
    },
    [employee?.employment?.previousEmployment, setFieldValue]
  );

  const handleDelete = useCallback(
    (rowIndex: number) => {
      const updatedDetails = [
        ...(employee?.employment?.previousEmployment || [])
      ];
      updatedDetails.splice(rowIndex, 1);

      setEmploymentDetails({
        ...employee?.employment,
        previousEmployment: updatedDetails
      });
      if (rowEdited === rowIndex) {
        setRowEdited(-1);
        resetForm();
      }
    },
    [employee?.employment, rowEdited, resetForm, setEmploymentDetails]
  );

  const formatTableData = useCallback(
    (
      data: L3PreviousEmploymentDetailsType[]
    ): L3PreviousEmploymentDetailsType[] => {
      if (!data) return [];

      return data.map((employment) => {
        return {
          companyName: employment?.companyName,
          jobTitle: employment?.jobTitle,
          startDate: employment?.startDate
            ? employment?.startDate.split("T")[0]
            : "",
          endDate: employment?.endDate ? employment?.endDate.split("T")[0] : ""
        };
      });
    },
    []
  );

  return {
    values,
    errors,
    handleSubmit,
    handleInput,
    dateOnChange,
    handleEdit,
    handleDelete,
    formatTableData,
    selectedStartDate,
    selectedEndDate,
    rowEdited,
    setSelectedStartDate,
    setSelectedEndDate
  };
};

export default usePreviousEmploymentDetailsFormHandlers;
