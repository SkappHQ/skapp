import { Grid2 as Grid } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, JSX, SyntheticEvent, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import CustomTable from "~community/common/components/molecules/CustomTable/CustomTable";
import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { onlyLettersAndSpaces } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import { usePeopleStore } from "~community/people/store/store";
import { VisaDetailsType } from "~community/people/types/AddNewResourceTypes";
import { employeeVisaDetailsValidation } from "~community/people/utils/peopleValidations";

interface Props {
  isInputsDisabled?: boolean;
}

const VisaDetailsSection = (props: Props): JSX.Element => {
  const { isInputsDisabled } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "visaDetails"
  );
  const translateButtonText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const { employeeVisaDetails, setEmployeeVisaDetails } = usePeopleStore(
    (state) => state
  );

  const [rowEdited, setRowEdited] = useState(-1);
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedIssuedDate, setSelectedIssuedDate] = useState<
    DateTime | undefined
  >(undefined);
  const initialValues = {
    visaType: "",
    issuingCountry: "",
    issuedDate: "",
    expirationDate: ""
  };

  const countryList = useGetCountryList();
  const formatData = (data: VisaDetailsType[]): VisaDetailsType[] => {
    if (!data) return [];

    return data.map((detail) => {
      return {
        visaType: detail?.visaType,
        issuingCountry: detail?.issuingCountry,
        issuedDate: detail?.issuedDate?.split("T")[0],
        expirationDate: detail?.expirationDate?.split("T")[0]
      };
    });
  };

  const tableHeaders = [
    translateText(["visaType"]),
    translateText(["issuingCountry"]),
    translateText(["issuedDate"]),
    translateText(["expirationDate"])
  ];

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const detail = employeeVisaDetails?.visaDetails[rowIndex];
    const { visaType, issuingCountry, issuedDate, expirationDate } = detail;
    void setFieldValue("visaType", visaType);
    void setFieldValue("issuingCountry", issuingCountry);
    void setFieldValue("issuedDate", issuedDate);
    void setFieldValue("expirationDate", expirationDate);
  };

  const handleDelete = (rowIndex: number) => {
    const updatedDetails = [...(employeeVisaDetails?.visaDetails || [])];
    updatedDetails.splice(rowIndex, 1);
    setEmployeeVisaDetails(updatedDetails);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const onSubmit = (values: VisaDetailsType) => {
    if (rowEdited > -1) {
      const details = employeeVisaDetails?.visaDetails;
      details?.splice(rowEdited, 1, {
        ...values,
        visaId: details[rowEdited].visaId
      });
      setEmployeeVisaDetails(details);
      setRowEdited(-1);
    } else {
      setEmployeeVisaDetails([
        ...(employeeVisaDetails?.visaDetails ?? []),
        values
      ]);
    }
    resetForm();
    setSelectedIssuedDate(undefined);
    setSelectedExpirationDate(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeVisaDetailsValidation(translateText),
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

    if (value === "" || onlyLettersAndSpaces().test(value)) {
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

  const handleCountrySelect = async (
    event: SyntheticEvent,
    newValue: DropdownListType
  ): Promise<void> => {
    await setFieldValue("issuingCountry", newValue.value);
    setFieldError("issuingCountry", "");
  };

  useEffect(() => {
    if (values.expirationDate) {
      const expirationDateTime = DateTime.fromISO(values.expirationDate);
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
  }, [values.expirationDate, values.issuedDate]);

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
            label={translateText(["visaType"])}
            value={values.visaType}
            placeHolder={translateText(["selectVisaType"])}
            onChange={handleInput}
            inputName="visaType"
            error={errors.visaType ?? ""}
            componentStyle={{
              mt: "0rem"
            }}
            maxLength={50}
            isDisabled={isInputsDisabled}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <DropdownAutocomplete
            itemList={countryList}
            inputName="issuingCountry"
            label={translateText(["issuingCountry"])}
            value={
              values.issuingCountry
                ? {
                    label: values.issuingCountry,
                    value: values.issuingCountry
                  }
                : undefined
            }
            placeholder={translateText(["selectIssuingCountry"])}
            onChange={handleCountrySelect}
            error={errors.issuingCountry ?? ""}
            componentStyle={{
              mt: "0rem"
            }}
            isDisabled={isInputsDisabled}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["issuedDate"])}
            value={DateTime.fromISO(values.issuedDate ?? "")}
            onchange={async (newValue: string) =>
              await dateOnChange(
                "issuedDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            placeholder={translateText(["selectIssuedDate"])}
            error={errors.issuedDate ?? ""}
            maxDate={DateTime.fromISO(
              convertDateToFormat(new Date(), LONG_DATE_TIME_FORMAT)
            )}
            componentStyle={{
              mt: "0rem"
            }}
            inputFormat="dd/MM/yyyy"
            disableMaskedInput
            disabled={isInputsDisabled}
            setSelectedDate={setSelectedIssuedDate}
            selectedDate={selectedIssuedDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["expirationDate"])}
            value={DateTime.fromISO(values.expirationDate ?? "")}
            inputFormat="dd/MM/yyyy"
            onchange={async (newValue: string) =>
              await dateOnChange(
                "expirationDate",
                convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
              )
            }
            minDate={DateTime.fromISO(values.issuedDate ?? "")}
            placeholder={translateText(["selectExpirationDate"])}
            error={errors.expirationDate ?? ""}
            componentStyle={{
              mt: "0rem"
            }}
            disableMaskedInput
            disabled={isInputsDisabled}
            setSelectedDate={setSelectedExpirationDate}
            selectedDate={selectedExpirationDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          {!isInputsDisabled && (
            <ButtonV2
              onClick={() => handleSubmit()}
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
            </ButtonV2>
          )}
        </Grid>
        {employeeVisaDetails?.visaDetails?.length === 0 ? null : (
          <CustomTable
            data={formatData(employeeVisaDetails?.visaDetails)}
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

export default VisaDetailsSection;
