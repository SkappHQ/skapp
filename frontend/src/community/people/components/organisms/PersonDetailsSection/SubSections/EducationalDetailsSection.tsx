import { Grid2 as Grid } from "@mui/material";
import { DateTime } from "luxon";
import { JSX } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import {
  LONG_DATE_TIME_FORMAT,
  REVERSE_DATE_FORMAT
} from "~community/common/constants/timeConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import PeopleFormTable from "~community/people/components/molecules/PeopleFormTable/PeopleFormTable";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import useEducationalDetailsFormHandlers from "~community/people/hooks/useEducationalDetailsFormHandlers";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const EducationalDetailsSection = (props: Props): JSX.Element => {
  const { isInputsDisabled, isReadOnly = false } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "educationDetails"
  );
  const translateButtonText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "educationDetails"
  );

  const { employee } = usePeopleStore((state) => state);

  const {
    rowEdited,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    values,
    errors,
    handleSubmit,
    handleInput,
    dateOnChange,
    handleEdit,
    handleDelete,
    formatTableData
  } = useEducationalDetailsFormHandlers();

  const tableHeaders = [
    translateText(["college"]),
    translateText(["degree"]),
    translateText(["major"]),
    translateText(["startDate"]),
    translateText(["endDate"])
  ];

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
      <Grid
        container
        spacing={2}
        sx={{
          mb: "2rem"
        }}
      >
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            label={translateText(["college"])}
            inputType="text"
            value={values.institutionName}
            placeHolder={translateText(["enterCollege"])}
            onChange={handleInput}
            inputName="institutionName"
            error={errors.institutionName ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
            isDisabled={isInputsDisabled}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            label={translateText(["degree"])}
            inputType="text"
            value={values.degree}
            placeHolder={translateText(["enterDegree"])}
            onChange={handleInput}
            inputName="degree"
            error={errors.degree ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
            isDisabled={isInputsDisabled}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            label={translateText(["major"])}
            inputType="text"
            value={values.major}
            placeHolder={translateText(["enterMajor"])}
            onChange={handleInput}
            inputName="major"
            error={errors.major ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            maxLength={ADDRESS_MAX_CHARACTER_LENGTH}
            isDisabled={isInputsDisabled}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["startDate"])}
            value={selectedStartDate || DateTime.fromISO("")}
            onchange={async (newValue: string) =>
              await dateOnChange(
                "startDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectStartDate"])}
            error={errors.startDate ?? ""}
            componentStyle={{
              mt: "0rem"
            }}
            maxDate={DateTime.fromISO(new Date().toISOString())}
            disabled={isInputsDisabled}
            inputFormat={REVERSE_DATE_FORMAT}
            selectedDate={selectedStartDate}
            setSelectedDate={setSelectedStartDate}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["endDate"])}
            value={selectedEndDate || DateTime.fromISO("")}
            onchange={async (newValue: string) =>
              await dateOnChange(
                "endDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectEndDate"])}
            error={errors.endDate ?? ""}
            minDate={
              values.startDate
                ? DateTime.fromISO(
                    convertDateToFormat(
                      new Date(values.startDate),
                      LONG_DATE_TIME_FORMAT
                    )
                  )
                : DateTime.fromISO("")
            }
            disabled={isInputsDisabled}
            componentStyle={{
              mt: "0rem"
            }}
            inputFormat={REVERSE_DATE_FORMAT}
            selectedDate={selectedEndDate}
            setSelectedDate={setSelectedEndDate}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          {!isInputsDisabled && (
            <Button
              label={
                rowEdited > -1
                  ? translateButtonText(["saveChanges"])
                  : translateButtonText(["add"])
              }
              onClick={() => handleSubmit()}
              endIcon={rowEdited > -1 ? IconName.SAVE_ICON : IconName.ADD_ICON}
              isFullWidth={false}
              buttonStyle={ButtonStyle.SECONDARY}
              size={ButtonSizes.MEDIUM}
              styles={{
                mt: "2rem"
              }}
              disabled={isInputsDisabled || isReadOnly}
              type={ButtonTypes.SUBMIT}
            />
          )}
        </Grid>

        {employee?.personal?.educational?.length === 0 ||
        employee?.personal?.educational === null ? null : (
          <PeopleFormTable
            data={formatTableData(employee?.personal?.educational || [])}
            actionsNeeded={!isInputsDisabled}
            onEdit={handleEdit}
            onDelete={handleDelete}
            headings={tableHeaders}
            tableStyles={{
              mt: "2rem"
            }}
            tableName={translateAria(["educationalDetailsTable"])}
          />
        )}
      </Grid>
    </PeopleLayout>
  );
};

export default EducationalDetailsSection;
