import { useFormik } from "formik";
import { DateTime } from "luxon";
import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { onlyLettersAndSpaces } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import { usePeopleStore } from "~community/people/store/store";
import { L3VisaDetailsType } from "~community/people/types/PeopleTypes";
import { employeeVisaDetailsValidation } from "~community/people/utils/peopleValidations";

const useVisaDetailsFormHandlers = () => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "visaDetails"
  );

  const [rowEdited, setRowEdited] = useState(-1);
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedIssuedDate, setSelectedIssuedDate] = useState<
    DateTime | undefined
  >(undefined);

  const { employee, setEmploymentDetails } = usePeopleStore((state) => state);
  const countryList = useGetCountryList();

  const initialValues = useMemo<L3VisaDetailsType>(() => {
    const emptyInitialValues: L3VisaDetailsType = {
      visaType: "",
      issuingCountry: "",
      issuedDate: "",
      expiryDate: ""
    };

    return {
      ...emptyInitialValues,
      ...(rowEdited > -1 && employee?.employment?.visaDetails?.[rowEdited])
    };
  }, [employee?.employment?.visaDetails, rowEdited]);

  const formik = useFormik({
    initialValues,
    validationSchema: employeeVisaDetailsValidation(translateText),
    onSubmit: (values: L3VisaDetailsType) => {
      if (rowEdited > -1) {
        const visaDetails = [...(employee?.employment?.visaDetails || [])];
        visaDetails.splice(rowEdited, 1, {
          ...values,
          visaId: visaDetails[rowEdited]?.visaId ?? rowEdited
        });
        setEmploymentDetails({
          ...employee?.employment,
          visaDetails: visaDetails
        });
        setRowEdited(-1);
      } else {
        const newVisaId = (employee?.employment?.visaDetails?.length ?? 0) + 1;
        setEmploymentDetails({
          ...employee?.employment,
          visaDetails: [
            ...(employee?.employment?.visaDetails || []),
            {
              ...values,
              visaId: newVisaId
            }
          ]
        });
      }
      resetForm();
      setSelectedIssuedDate(undefined);
      setSelectedExpirationDate(undefined);
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

      if (value === "" || onlyLettersAndSpaces().test(value)) {
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

  const handleCountrySelect = useCallback(
    async (
      event: SyntheticEvent,
      newValue: DropdownListType
    ): Promise<void> => {
      await setFieldValue("issuingCountry", newValue.value);
      setFieldError("issuingCountry", "");
    },
    [setFieldError, setFieldValue]
  );

  useEffect(() => {
    if (values.expiryDate) {
      const expirationDateTime = DateTime.fromISO(values.expiryDate);
      setSelectedExpirationDate(expirationDateTime);
    } else {
      setSelectedExpirationDate(undefined);
    }
    if (values.issuedDate) {
      const issuedDateTime = DateTime.fromISO(values.issuedDate);
      setSelectedIssuedDate(issuedDateTime);
    } else {
      setSelectedIssuedDate(undefined);
    }
  }, [values.expiryDate, values.issuedDate]);

  const handleEdit = useCallback(
    (rowIndex: number) => {
      setRowEdited(rowIndex);
      const visaDetails = employee?.employment?.visaDetails?.[rowIndex];

      if (visaDetails) {
        setFieldValue("visaType", visaDetails.visaType);
        setFieldValue("issuingCountry", visaDetails.issuingCountry);
        setFieldValue("issuedDate", visaDetails.issuedDate);
        setFieldValue("expiryDate", visaDetails.expiryDate);
      }
    },
    [employee?.employment?.visaDetails, setFieldValue]
  );

  const handleDelete = useCallback(
    (rowIndex: number) => {
      const updatedDetails = [...(employee?.employment?.visaDetails || [])];
      updatedDetails.splice(rowIndex, 1);
      setEmploymentDetails({
        ...employee?.employment,
        visaDetails: updatedDetails
      });
      if (rowEdited === rowIndex) {
        setRowEdited(-1);
        resetForm();
      }
    },
    [employee?.employment, rowEdited, resetForm, setEmploymentDetails]
  );

  const formatTableData = useCallback(
    (data: L3VisaDetailsType[]): L3VisaDetailsType[] => {
      if (!data) return [];

      return data.map((detail) => {
        return {
          visaType: detail?.visaType,
          issuingCountry: detail?.issuingCountry,
          issuedDate: detail?.issuedDate?.split("T")[0],
          expirationDate: detail?.expiryDate?.split("T")[0]
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
    handleCountrySelect,
    handleEdit,
    handleDelete,
    formatTableData,
    selectedExpirationDate,
    selectedIssuedDate,
    setSelectedExpirationDate,
    setSelectedIssuedDate,
    countryList,
    rowEdited
  };
};

export default useVisaDetailsFormHandlers;
