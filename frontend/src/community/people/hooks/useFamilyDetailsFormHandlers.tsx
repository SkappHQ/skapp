import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { isValidNamePattern } from "~community/common/utils/validation";
import { MaritalStatusTypes } from "~community/people/enums/PeopleEnums";
import { usePeopleStore } from "~community/people/store/store";
import { RelationshipTypes } from "~community/people/types/AddNewResourceTypes";
import { L3FamilyDetailsType } from "~community/people/types/PeopleTypes";
import { RelationshipList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeFamilyDetailsValidation } from "~community/people/utils/peopleValidations";

const useFamilyDetailsFormHandlers = () => {
  const [rowEdited, setRowEdited] = useState(-1);
  const [relationshipList, setRelationshipList] = useState(RelationshipList);
  const [disableParentName, setDisableParentName] = useState(true);
  const [selectedDob, setSelectedDob] = useState<DateTime | undefined>(
    undefined
  );

  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "familyDetails"
  );

  const initialValues = useMemo<L3FamilyDetailsType>(() => {
    const emptyInitialValues: L3FamilyDetailsType = {
      familyId: undefined,
      firstName: "",
      lastName: "",
      gender: undefined,
      relationship: undefined,
      parentName: "",
      dateOfBirth: ""
    };

    return {
      ...emptyInitialValues,
      ...(rowEdited > -1 && employee?.personal?.family?.[rowEdited])
    };
  }, [employee?.personal?.family, rowEdited]);

  const formik = useFormik({
    initialValues,
    validationSchema: employeeFamilyDetailsValidation(translateText),
    onSubmit: (values: L3FamilyDetailsType) => {
      const familyData = {
        ...values,
        dateOfBirth: values.dateOfBirth
      };

      if (rowEdited > -1) {
        const members = [...(employee?.personal?.family || [])];
        members.splice(rowEdited, 1, {
          ...familyData,
          familyId: members[rowEdited]?.familyId ?? rowEdited
        });
        setPersonalDetails({
          general: employee?.personal?.general,
          family: members
        });
        setRowEdited(-1);
      } else {
        const newMemberId = (employee?.personal?.family?.length ?? 0) + 1;
        setPersonalDetails({
          general: employee?.personal?.general,
          family: [
            ...(employee?.personal?.family || []),
            {
              ...familyData,
              familyId: newMemberId
            }
          ]
        });
      }
      resetForm();
      setSelectedDob(undefined);
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
    setFieldError,
    handleChange
  } = formik;

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isValidNamePattern(value)) {
      await setFieldValue(name, value);
      setFieldError(name, "");
    }
  };

  const handleDateChange = async (newValue: string): Promise<void> => {
    const formattedDate = convertDateToFormat(
      new Date(newValue),
      LONG_DATE_TIME_FORMAT
    );
    await setFieldValue("dateOfBirth", formattedDate);
    setFieldError("dateOfBirth", "");
  };

  useEffect(() => {
    if (
      employee?.personal?.general?.maritalStatus == null ||
      employee?.personal?.general?.maritalStatus !== MaritalStatusTypes.MARRIED
    ) {
      setRelationshipList(
        RelationshipList.filter(
          (item) => item.value !== RelationshipTypes.SPOUSE
        )
      );
    } else {
      setRelationshipList(RelationshipList);
    }

    setDisableParentName(values.relationship !== RelationshipTypes.CHILD);
  }, [employee?.personal?.general?.maritalStatus, values.relationship]);

  useEffect(() => {
    if (rowEdited > -1) {
      const member = employee?.personal?.family?.[rowEdited];
      if (member) {
        setFieldValue("firstName", member.firstName ?? "");
        setFieldValue("lastName", member.lastName ?? "");
        setFieldValue("gender", member.gender ?? "");
        setFieldValue("relationship", member.relationship ?? "");
        setFieldValue("parentName", member.parentName ?? "");
        setFieldValue("dateOfBirth", member.dateOfBirth ?? "");

        if (member.dateOfBirth) {
          setSelectedDob(DateTime.fromJSDate(new Date(member.dateOfBirth)));
        } else {
          setSelectedDob(undefined);
        }
      }
    }
  }, [rowEdited, employee?.personal?.family, setFieldValue]);

  return {
    rowEdited,
    setRowEdited,
    relationshipList,
    disableParentName,
    selectedDob,
    setSelectedDob,
    values,
    errors,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    handleChange,
    handleInput,
    handleDateChange
  };
};

export default useFamilyDetailsFormHandlers;
