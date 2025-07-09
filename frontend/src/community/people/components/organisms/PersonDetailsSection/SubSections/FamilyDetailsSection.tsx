import { Grid2 as Grid } from "@mui/material";
import { DateTime } from "luxon";

import Button from "~community/common/components/atoms/Button/Button";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { REVERSE_DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getLabelByValue } from "~community/common/utils/commonUtil";
import PeopleFormTable from "~community/people/components/molecules/PeopleFormTable/PeopleFormTable";
import { NAME_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import useFamilyDetailsFormHandlers from "~community/people/hooks/useFamilyDetailsFormHandlers";
import { usePeopleStore } from "~community/people/store/store";
import { L3FamilyDetailsType } from "~community/people/types/PeopleTypes";
import {
  GenderList,
  RelationshipList
} from "~community/people/utils/data/employeeSetupStaticData";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const FamilyDetailsSection = ({
  isInputsDisabled,
  isReadOnly = false
}: Props) => {
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
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "familyDetails"
  );

  const {
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
    handleChange,
    handleInput,
    handleDateChange
  } = useFamilyDetailsFormHandlers();

  const tableHeaders = [
    translateText(["firstName"]),
    translateText(["lastName"]),
    translateText(["gender"]),
    translateText(["relationship"]),
    translateText(["parentName"]),
    translateText(["birthDate"]),
    translateText(["age"])
  ];

  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const member = employee?.personal?.family?.[rowIndex];

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
  };

  const handleDelete = (rowIndex: number) => {
    const updatedMembers = [...(employee?.personal?.family || [])];
    updatedMembers.splice(rowIndex, 1);
    setPersonalDetails({
      general: employee?.personal?.general,
      family: updatedMembers
    });
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
      setSelectedDob(undefined);
    }
  };

  const formatTableData = (data: L3FamilyDetailsType[]) => {
    if (!data) return [];

    return data.map((member) => {
      return {
        firstName: member?.firstName ?? "",
        lastName: member?.lastName ?? "",
        gender: getLabelByValue(GenderList, member?.gender as string) ?? "",
        relationship:
          getLabelByValue(RelationshipList, member?.relationship as string) ??
          "",
        parentName: member?.parentName ?? "",
        dateOfBirth: member?.dateOfBirth?.split("T")[0],
        age: member?.dateOfBirth
          ? new Date().getFullYear() -
            new Date(member.dateOfBirth).getFullYear()
          : undefined
      };
    });
  };

  return (
    <PeopleFormSectionWrapper
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
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <DropdownList
            inputName="gender"
            label={translateText(["gender"])}
            value={values.gender ?? ""}
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
            readOnly={isReadOnly}
            ariaLabel={translateAria(["selectGender"])}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <DropdownList
            inputName="relationship"
            label={translateText(["relationship"])}
            value={values.relationship ?? ""}
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
            readOnly={isReadOnly}
            ariaLabel={translateAria(["selectRelationship"])}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["birthDate"])}
            value={selectedDob || DateTime.fromISO("")}
            onchange={async (newValue: string) =>
              await handleDateChange(newValue)
            }
            placeholder={translateText(["selectBirthDate"])}
            error={errors.dateOfBirth ?? ""}
            maxDate={DateTime.fromISO(new Date().toISOString())}
            componentStyle={{
              mt: "0rem"
            }}
            disabled={isInputsDisabled}
            inputFormat={REVERSE_DATE_FORMAT}
            selectedDate={selectedDob}
            setSelectedDate={setSelectedDob}
            readOnly={isReadOnly}
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
              readOnly={isReadOnly}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          {!isInputsDisabled && (
            <Button
              isFullWidth={false}
              label={
                rowEdited > -1
                  ? translateButtonText(["saveChanges"])
                  : translateButtonText(["add"])
              }
              onClick={() => handleSubmit()}
              endIcon={rowEdited > -1 ? IconName.RIGHT_MARK : IconName.ADD_ICON}
              buttonStyle={ButtonStyle.SECONDARY}
              size={ButtonSizes.MEDIUM}
              styles={{
                mt: disableParentName ? "2rem" : "1rem"
              }}
              disabled={isInputsDisabled || isReadOnly}
              type={ButtonTypes.SUBMIT}
            />
          )}
        </Grid>

        {!employee?.personal?.family?.length ? null : (
          <PeopleFormTable
            data={formatTableData(employee.personal.family)}
            actionsNeeded={!isInputsDisabled && !isReadOnly}
            onEdit={handleEdit}
            onDelete={handleDelete}
            headings={tableHeaders}
            tableStyles={{
              mt: "2rem"
            }}
            tableName={translateAria(["familyDetailsTable"])}
          />
        )}
      </Grid>
    </PeopleFormSectionWrapper>
  );
};

export default FamilyDetailsSection;
