import { Grid2 as Grid } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, JSX, useCallback, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import CustomTable from "~community/common/components/molecules/CustomTable/CustomTable";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { isValidNamePattern } from "~community/common/utils/validation";
import { ADDRESS_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { EducationalDetailsType } from "~community/people/types/AddNewResourceTypes";
import { employeeEducationalDetailsValidation } from "~community/people/utils/peopleValidations";

interface Props {
  isInputsDisabled?: boolean;
}

const EducationalDetailsSection = (props: Props): JSX.Element => {
  const { isInputsDisabled } = props;
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );
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
  const [rowEdited, setRowEdited] = useState(-1);
  const { employeeEducationalDetails, setEmployeeEducationalDetails } =
    usePeopleStore((state) => state);

  const initialValues = {
    institutionName: "",
    degree: "",
    major: "",
    startDate: "",
    endDate: ""
  };

  const formatData = (
    data: EducationalDetailsType[]
  ): EducationalDetailsType[] => {
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

  const tableHeaders = [
    translateText(["college"]),
    translateText(["degree"]),
    translateText(["major"]),
    translateText(["startDate"]),
    translateText(["endDate"])
  ];

  const handleEdit = (rowIndex: number): void => {
    setRowEdited(rowIndex);
    const educationalDetail =
      employeeEducationalDetails?.educationalDetails[rowIndex];
    const { institutionName, degree, major, startDate, endDate } =
      educationalDetail;

    void setFieldValue("institutionName", institutionName);
    void setFieldValue("degree", degree);
    void setFieldValue("major", major);
    void setFieldValue("startDate", startDate ?? "");
    void setFieldValue("endDate", endDate ?? "");
  };

  const handleDelete = (rowIndex: number): void => {
    const updatedEducationalDetails = [
      ...(employeeEducationalDetails?.educationalDetails || [])
    ];
    updatedEducationalDetails.splice(rowIndex, 1);
    setEmployeeEducationalDetails(updatedEducationalDetails);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const onSubmit = (values: EducationalDetailsType) => {
    if (rowEdited > -1) {
      const details = employeeEducationalDetails?.educationalDetails || [];
      details.splice(rowEdited, 1, {
        educationId: details[rowEdited].educationId,
        ...values
      });
      setEmployeeEducationalDetails(details);
      setRowEdited(-1);
    } else {
      setEmployeeEducationalDetails([
        ...(employeeEducationalDetails?.educationalDetails || []),
        values
      ]);
    }
    resetForm();
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeEducationalDetailsValidation(translateText),
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

  useEffect(() => {
    if (values.startDate) {
      const startDate = DateTime.fromISO(values.startDate);
      setSelectedStartDate(startDate);
    } else {
      setSelectedStartDate(undefined);
    }
    if (values.endDate) {
      const endDate = DateTime.fromISO(values.endDate);
      setSelectedEndDate(endDate);
    } else {
      setSelectedEndDate(undefined);
    }
  }, []);

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
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["startDate"])}
            value={DateTime.fromISO(values.startDate ?? "")}
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
            inputFormat="dd/MM/yyyy"
            selectedDate={selectedStartDate}
            setSelectedDate={setSelectedStartDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["endDate"])}
            value={DateTime.fromISO(values.endDate ?? "")}
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
            inputFormat="dd/MM/yyyy"
            selectedDate={selectedEndDate}
            setSelectedDate={setSelectedEndDate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          {!isInputsDisabled && (
            <ButtonV2
              onClick={() => handleSubmit()}
              fullWidth={false}
              variant={"secondary"}
              size={"md"}
              disabled={isInputsDisabled}
              type={"submit"}
              icon={
                rowEdited > -1 ? (
                  <Icon name={IconName.SAVE_ICON} />
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
        {employeeEducationalDetails?.educationalDetails?.length === 0 ? null : (
          <CustomTable
            data={formatData(employeeEducationalDetails?.educationalDetails)}
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

export default EducationalDetailsSection;
