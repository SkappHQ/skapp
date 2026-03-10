import { Grid2 as Grid, useTheme } from "@mui/material";
import { Button } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, JSX, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import CustomTable from "~community/common/components/molecules/CustomTable/CustomTable";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import {
  isValidAlphaNumericNamePattern,
  isValidNamePattern
} from "~community/common/utils/validation";
import { usePeopleStore } from "~community/people/store/store";
import { PreviousEmploymentDetailsType } from "~community/people/types/AddNewResourceTypes";
import { employeePreviousEmploymentDetailsValidation } from "~community/people/utils/peopleValidations";

interface Props {
  isInputsDisabled?: boolean;
}

const PreviousEmploymentDetailsSection = (props: Props): JSX.Element => {
  const theme = useTheme();
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );
  const { isInputsDisabled } = props;
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
  const {
    employeePreviousEmploymentDetails,
    employeeEmploymentDetails,
    setEmployeePreviousEmploymentDetails
  } = usePeopleStore((state) => state);

  const [rowEdited, setRowEdited] = useState(-1);

  const initialValues = {
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: ""
  };

  const formatData = (
    data: PreviousEmploymentDetailsType[]
  ): PreviousEmploymentDetailsType[] => {
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
  };

  const tableHeaders = [
    translateText(["companyName"]),
    translateText(["jobTitle"]),
    translateText(["startDate"]),
    translateText(["endDate"])
  ];

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const employment =
      employeePreviousEmploymentDetails?.previousEmploymentDetails[rowIndex];
    const { companyName, jobTitle, startDate, endDate } = employment;
    void setFieldValue("companyName", companyName);
    void setFieldValue("jobTitle", jobTitle);
    void setFieldValue("startDate", startDate);
    void setFieldValue("endDate", endDate);
  };

  const handleDelete = (rowIndex: number) => {
    const updatedDetails = [
      ...(employeePreviousEmploymentDetails?.previousEmploymentDetails || [])
    ];
    updatedDetails.splice(rowIndex, 1);
    setEmployeePreviousEmploymentDetails(updatedDetails);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const onSubmit = (values: PreviousEmploymentDetailsType) => {
    if (rowEdited > -1) {
      const employments =
        employeePreviousEmploymentDetails?.previousEmploymentDetails;
      employments?.splice(rowEdited, 1, values);
      setEmployeePreviousEmploymentDetails(employments);
      setRowEdited(-1);
    } else {
      setEmployeePreviousEmploymentDetails([
        ...(employeePreviousEmploymentDetails?.previousEmploymentDetails ?? []),
        values
      ]);
    }
    resetForm();
    setSelectedEndDate(undefined);
    setSelectedStartDate(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema:
      employeePreviousEmploymentDetailsValidation(translateText),
    onSubmit,
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

  const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "companyName" && isValidAlphaNumericNamePattern(value)) {
      await setFieldValue(name, value);
      setFieldError(name, "");
    } else if (name === "jobTitle" && isValidNamePattern(value)) {
      await setFieldValue(name, value);
      setFieldError(name, "");
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
    if (values.startDate) {
      const employmentStartDate = DateTime.fromISO(values.startDate);
      setSelectedStartDate(employmentStartDate);
    } else {
      setSelectedStartDate(undefined);
    }
    if (values.endDate) {
      const employmentEndDate = DateTime.fromISO(values.endDate);
      setSelectedStartDate(employmentEndDate);
    } else {
      setSelectedEndDate(undefined);
    }
  }, [values]);
  return (
    <PeopleLayout
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto"
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
            placeHolder={translateText(["companyName"])}
            onChange={handleInput}
            inputName="companyName"
            error={errors.companyName ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            isDisabled={isInputsDisabled}
            maxLength={50}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            label={translateText(["jobTitle"])}
            inputType="text"
            value={values.jobTitle}
            placeHolder={translateText(["jobTitle"])}
            onChange={handleInput}
            inputName="jobTitle"
            error={errors.jobTitle ?? ""}
            componentStyle={{
              flex: 1,
              mt: "0rem"
            }}
            isDisabled={isInputsDisabled}
            maxLength={50}
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
              employeeEmploymentDetails?.joinedDate
                ? employeeEmploymentDetails?.joinedDate
                : new Date().toISOString()
            )}
            componentStyle={{
              mt: "0rem"
            }}
            disableMaskedInput
            disabled={isInputsDisabled}
            selectedDate={selectedStartDate}
            setSelectedDate={setSelectedStartDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["endDate"])}
            value={DateTime.fromISO(values.endDate ?? "")}
            inputFormat="dd/MM/yyyy"
            onchange={async (newValue: string) =>
              await dateOnChange(
                "endDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectEndDate"])}
            error={errors.endDate ?? ""}
            maxDate={DateTime.fromISO(
              employeeEmploymentDetails?.joinedDate
                ? employeeEmploymentDetails?.joinedDate
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
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          {!isInputsDisabled && (
            <Button
              onClick={() => handleSubmit()}
              fullWidth={false}
              variant={"secondary"}
              size={"md"}
              type={"submit"}
              disabled={isInputsDisabled}
              icon={
                rowEdited > -1 ? (
                  <Icon name={IconName.TICK_ICON} />
                ) : (
                  <Icon name={IconName.ADD_ICON} />
                )
              }
              iconPosition="end"
            >
              {rowEdited > -1
                ? translateButtonText(["saveChanges"])
                : translateButtonText(["add"])}
            </Button>
          )}
        </Grid>
        {employeePreviousEmploymentDetails?.previousEmploymentDetails
          ?.length === 0 ? null : (
          <CustomTable
            data={formatData(
              employeePreviousEmploymentDetails?.previousEmploymentDetails
            )}
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
    </PeopleLayout>
  );
};

export default PreviousEmploymentDetailsSection;
