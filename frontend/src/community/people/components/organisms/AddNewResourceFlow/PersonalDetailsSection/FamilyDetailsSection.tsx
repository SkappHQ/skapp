import { Grid2 as Grid } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, JSX, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import CustomTable from "~community/common/components/molecules/CustomTable/CustomTable";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getLabelByValue } from "~community/common/utils/commonUtil";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { isValidNamePattern } from "~community/common/utils/validation";
import { NAME_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import {
  FamilyMemberType,
  MaritalStatusTypes,
  RelationshipTypes
} from "~community/people/types/AddNewResourceTypes";
import {
  GenderList,
  RelationshipList
} from "~community/people/utils/data/employeeSetupStaticData";
import { employeeFamilyDetailsValidation } from "~community/people/utils/peopleValidations";

interface Props {
  isInputsDisabled?: boolean;
}

const FamilyDetailsSection = (props: Props): JSX.Element => {
  const { isInputsDisabled } = props;

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "familyDetails"
  );
  const translateButtonText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const {
    employeeFamilyDetails,
    setEmployeeFamilyDetails,
    employeeGeneralDetails
  } = usePeopleStore((state) => state);

  const [rowEdited, setRowEdited] = useState(-1);
  const [relationshipList, setRelationshipList] = useState(RelationshipList);
  const [disableParentName, setDisableParentName] = useState(false);
  const [selectedDob, setSelectedDob] = useState<DateTime | undefined>(
    undefined
  );
  const initialValues: FamilyMemberType = {
    firstName: "",
    lastName: "",
    gender: "",
    relationship: "",
    birthDate: "",
    parentName: ""
  };

  const formatData = (data: FamilyMemberType[]): FamilyMemberType[] => {
    if (!data) return [];

    return data.map((member) => {
      return {
        firstName: member?.firstName ?? "",
        lastName: member?.lastName ?? "",
        gender: getLabelByValue(GenderList, member?.gender) ?? "",
        relationship:
          getLabelByValue(RelationshipList, member?.relationship) ?? "",
        parentName: member?.parentName,
        birthDate: member?.birthDate?.split("T")?.[0],
        age:
          new Date().getFullYear() - new Date(member?.birthDate).getFullYear()
      };
    });
  };

  const tableHeaders = [
    translateText(["firstName"]),
    translateText(["lastName"]),
    translateText(["gender"]),
    translateText(["relationship"]),
    translateText(["parentName"]),
    translateText(["birthDate"]),
    translateText(["age"])
  ];

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const member = employeeFamilyDetails?.familyMembers[rowIndex];
    const { firstName, lastName, gender, relationship, birthDate, parentName } =
      member;
    void setFieldValue("firstName", firstName);
    void setFieldValue("lastName", lastName);
    void setFieldValue("gender", gender);
    void setFieldValue("relationship", relationship);
    void setFieldValue("parentName", parentName ?? "");
    void setFieldValue("birthDate", birthDate);
  };

  const handleDelete = (rowIndex: number) => {
    const updatedMembers = [...(employeeFamilyDetails?.familyMembers || [])];
    updatedMembers.splice(rowIndex, 1);
    setEmployeeFamilyDetails(updatedMembers);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const onSubmit = (values: FamilyMemberType) => {
    if (rowEdited > -1) {
      const members = employeeFamilyDetails?.familyMembers;
      members?.splice(rowEdited, 1, {
        ...values,
        familyId: members[rowEdited].familyId
      });
      setEmployeeFamilyDetails(members);
      setRowEdited(-1);
    } else {
      setEmployeeFamilyDetails([
        ...(employeeFamilyDetails?.familyMembers ?? []),
        values
      ]);
    }
    resetForm();
    setSelectedDob(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeFamilyDetailsValidation(translateText),
    onSubmit,
    validateOnChange: false
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
    if (isValidNamePattern(e.target.value)) {
      await setFieldValue(e.target.name, e.target.value);
      setFieldError(e.target.name, "");
    }
  };

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    await setFieldValue(fieldName, newValue);
    setFieldError(fieldName, "");
  };

  useEffect(() => {
    if (employeeGeneralDetails.maritalStatus !== MaritalStatusTypes.MARRIED) {
      setRelationshipList(
        RelationshipList.filter(
          (item) => item.value !== RelationshipTypes.SPOUSE
        )
      );
    } else {
      setRelationshipList(RelationshipList);
    }

    setDisableParentName(values.relationship === RelationshipTypes.SPOUSE);
  }, [employeeGeneralDetails?.maritalStatus, values.relationship]);

  useEffect(() => {
    if (values.birthDate) {
      const birthDate = DateTime.fromISO(values.birthDate);
      setSelectedDob(birthDate);
    } else {
      setSelectedDob(undefined);
    }
  }, [values.birthDate]);

  return (
    <PeopleLayout
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        height: "auto"
      }}
      dividerStyles={{
        mt: "0.5rem"
      }}
      pageHead={translateText(["head"])}
    >
      <>
        <Grid
          container
          spacing={2}
          sx={{
            mb: "2rem"
          }}
        >
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["firstName"])}
              inputType="text"
              value={values.firstName}
              placeHolder={translateText(["enterFirstName"])}
              onChange={handleInput}
              inputName="firstName"
              error={errors.firstName ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              maxLength={NAME_MAX_CHARACTER_LENGTH}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["lastName"])}
              inputType="text"
              value={values.lastName}
              placeHolder={translateText(["enterLastName"])}
              onChange={handleInput}
              inputName="lastName"
              error={errors.lastName ?? ""}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              maxLength={NAME_MAX_CHARACTER_LENGTH}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <DropdownList
              inputName="gender"
              label={translateText(["gender"])}
              value={values.gender}
              placeholder={translateText(["selectGender"])}
              onChange={handleChange}
              error={errors.gender ?? ""}
              componentStyle={{
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              errorFocusOutlineNeeded={false}
              itemList={GenderList}
              checkSelected
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <DropdownList
              inputName="relationship"
              label={translateText(["relationship"])}
              value={values.relationship}
              placeholder={translateText(["selectRelationship"])}
              onChange={handleChange}
              error={errors.relationship ?? ""}
              componentStyle={{
                mt: "0rem"
              }}
              isDisabled={isInputsDisabled}
              errorFocusOutlineNeeded={false}
              itemList={relationshipList}
              checkSelected
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputDate
              label={translateText(["birthDate"])}
              value={DateTime.fromISO(values.birthDate ?? "")}
              onchange={async (newValue: string) =>
                await dateOnChange(
                  "birthDate",
                  convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
                )
              }
              placeholder={translateText(["selectBirthDate"])}
              error={errors.birthDate ?? ""}
              maxDate={DateTime.fromISO(new Date().toISOString())}
              componentStyle={{
                mt: "0rem"
              }}
              disabled={isInputsDisabled}
              inputFormat="dd/MM/yyyy"
              selectedDate={selectedDob}
              setSelectedDate={setSelectedDob}
            />
          </Grid>

          {disableParentName ? null : (
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["parentName"])}
                inputType="text"
                value={values.parentName}
                placeHolder={translateText(["enterParentName"])}
                onChange={handleInput}
                inputName="parentName"
                error={errors.parentName ?? ""}
                isDisabled={isInputsDisabled}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                maxLength={NAME_MAX_CHARACTER_LENGTH}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            {!isInputsDisabled && (
              <ButtonV2
                onClick={() => handleSubmit()}
                variant={"secondary"}
                size={"md"}
                disabled={isInputsDisabled}
                type={"submit"}
                icon={
                  rowEdited > -1 ? (
                    <Icon name={IconName.RIGHT_MARK} />
                  ) : (
                    <Icon name={IconName.ADD_ICON} />
                  )
                }
                iconPosition="end"
              >
                {rowEdited > -1
                  ? translateButtonText(["saveChanges"])
                  : translateButtonText(["add"])}
              </ButtonV2>
            )}
          </Grid>
          {employeeFamilyDetails?.familyMembers?.length === 0 ? null : (
            <CustomTable
              data={formatData(employeeFamilyDetails?.familyMembers)}
              actionsNeeded={true && !isInputsDisabled}
              onEdit={handleEdit}
              onDelete={handleDelete}
              headings={tableHeaders}
              tableStyles={{
                mt: "2rem"
              }}
            />
          )}
        </Grid>
      </>
    </PeopleLayout>
  );
};

export default FamilyDetailsSection;
