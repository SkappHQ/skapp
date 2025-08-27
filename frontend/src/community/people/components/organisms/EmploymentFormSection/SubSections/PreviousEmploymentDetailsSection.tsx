import { Grid2 as Grid } from "@mui/material";
import { DateTime } from "luxon";

import Button from "~community/common/components/atoms/Button/Button";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
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
import usePreviousEmploymentDetailsFormHandlers from "~community/people/hooks/usePreviousEmploymentDetailsFormHandlers";
import { usePeopleStore } from "~community/people/store/store";
import { L3PreviousEmploymentDetailsType } from "~community/people/types/PeopleTypes";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}
const PreviousEmploymentDetailsSection = ({
  isInputsDisabled,
  isReadOnly = false
}: Props) => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "previousEmploymentDetails"
  );
  const translateButtonText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "previousEmploymentDetails"
  );

  const { employee } = usePeopleStore((state) => state);

  const {
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
  } = usePreviousEmploymentDetailsFormHandlers();

  const tableHeaders = [
    translateText(["companyName"]),
    translateText(["jobTitle"]),
    translateText(["startDate"]),
    translateText(["endDate"])
  ];

  return (
    <PeopleFormSectionWrapper
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        fontFamily: "Poppins, sans-serif"
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
            label={translateText(["companyName"])}
            inputType="text"
            value={values.companyName}
            placeHolder={translateText(["enterCompanyName"])}
            onChange={handleInput}
            inputName="companyName"
            error={errors.companyName ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            isDisabled={isInputsDisabled}
            maxLength={50}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            label={translateText(["jobTitle"])}
            inputType="text"
            value={values.jobTitle}
            placeHolder={translateText(["enterJobTitle"])}
            onChange={handleInput}
            inputName="jobTitle"
            error={errors.jobTitle ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            isDisabled={isInputsDisabled}
            maxLength={50}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["startDate"])}
            value={DateTime.fromISO(values.startDate ?? "")}
            inputFormat="dd/MM/yyyy"
            onchange={async (newValue: string) =>
              await dateOnChange(
                "startDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectStartDate"])}
            error={errors.startDate ?? ""}
            maxDate={DateTime.fromISO(
              employee?.employment?.employmentDetails?.joinedDate
                ? employee?.employment?.employmentDetails?.joinedDate
                : new Date().toISOString()
            )}
            componentStyle={{
              mt: "0rem"
            }}
            disableMaskedInput
            disabled={isInputsDisabled}
            selectedDate={selectedStartDate}
            setSelectedDate={setSelectedStartDate}
            readOnly={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["endDate"])}
            value={DateTime.fromISO(values.endDate ?? "")}
            inputFormat={REVERSE_DATE_FORMAT}
            onchange={async (newValue: string) =>
              await dateOnChange(
                "endDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectEndDate"])}
            error={errors.endDate ?? ""}
            maxDate={DateTime.fromISO(
              employee?.employment?.employmentDetails?.joinedDate
                ? employee?.employment?.employmentDetails?.joinedDate
                : new Date().toISOString()
            )}
            minDate={DateTime.fromISO(values.startDate ?? "")}
            componentStyle={{
              mt: "0rem"
            }}
            disableMaskedInput
            disabled={isInputsDisabled}
            setSelectedDate={setSelectedEndDate}
            selectedDate={selectedEndDate}
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
              endIcon={rowEdited > -1 ? IconName.TICK_ICON : IconName.ADD_ICON}
              isFullWidth={false}
              buttonStyle={ButtonStyle.SECONDARY}
              size={ButtonSizes.MEDIUM}
              styles={{
                mt: "2rem"
              }}
              type={ButtonTypes.SUBMIT}
              disabled={isInputsDisabled || isReadOnly}
            />
          )}
        </Grid>
        {employee?.employment?.previousEmployment?.length === 0 ||
        employee?.employment?.previousEmployment === null ? null : (
          <PeopleFormTable
            data={formatTableData(
              employee?.employment
                ?.previousEmployment as L3PreviousEmploymentDetailsType[]
            )}
            actionsNeeded={!isInputsDisabled && !isReadOnly}
            onEdit={handleEdit}
            onDelete={handleDelete}
            headings={tableHeaders}
            tableStyles={{
              mt: "2rem"
            }}
            tableName={translateAria(["previousEmploymentTable"])}
          />
        )}
      </Grid>
    </PeopleFormSectionWrapper>
  );
};

export default PreviousEmploymentDetailsSection;
