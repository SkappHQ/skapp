import { Checkbox, Grid2 as Grid, Typography, useTheme } from "@mui/material";
import { useFormik } from "formik";
import { DateTime } from "luxon";

import Button from "~community/common/components/atoms/Button/Button";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InteractiveInputTrigger from "~community/common/components/molecules/InteractiveInputTrigger/InteractiveInputTrigger";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  convertDateToFormat,
  getDateFromTimeStamp
} from "~community/common/utils/dateTimeUtils";
import PeopleFormTable from "~community/people/components/molecules/PeopleFormTable/PeopleFormTable";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { EmploymentTypes } from "~community/people/enums/PeopleEnums";
import useCareerProgressionFormHandler from "~community/people/hooks/useCareerProgressionFormHandler";
import { usePeopleStore } from "~community/people/store/store";
import { L3CareerProgressionDetailsType } from "~community/people/types/PeopleTypes";
import { EmployeeTypesList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeCareerDetailsValidation } from "~community/people/utils/peopleFormValidation";

import JobFamilyModalController from "../../JobFamilyModalController/JobFamilyModalController";
import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isReadOnly?: boolean;
  isProfileView?: boolean;
  isInputsDisabled?: boolean;
}

const CareerProgressDetailsSection = ({
  isReadOnly = false,
  isProfileView = false,
  isInputsDisabled = false
}: Props) => {
  const theme = useTheme();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "careerDetails"
  );
  const translateButtonText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "careerProgression"
  );

  const {
    setIsJobFamilyModalOpen,
    setJobFamilyModalType,
    employee,
    setEmploymentDetails
  } = usePeopleStore((state) => state);

  const initialValues: L3CareerProgressionDetailsType = {
    employmentType: "" as EmploymentTypes,
    jobFamilyId: 0,
    jobTitleId: 0,
    startDate: "",
    endDate: "",
    isCurrentEmployment: false
  };

  const tableHeaders = [
    "",
    translateText(["employmentType"]),
    translateText(["jobFamily"]),
    translateText(["jobTitle"]),
    translateText(["startDate"]),
    translateText(["endDate"]),
    translateText(["tenure"])
  ];

  const onSubmit = (values: L3CareerProgressionDetailsType) => {
    const positions = copyOfEmployeeCareerDetails || [];
    const { startDate, endDate, isCurrentEmployment } = values;

    const newStartDate = new Date(
      getDateFromTimeStamp(startDate ?? "")
    )?.getTime();
    const newEndDate = isCurrentEmployment
      ? new Date()?.getTime()
      : new Date(getDateFromTimeStamp(endDate ?? ""))?.getTime();

    const { hasOverlap, overlapType } = checkOverlap({
      positions,
      newStartDate,
      newEndDate,
      newCurrentPosition: isCurrentEmployment as boolean
    });

    if (hasOverlap) {
      if (overlapType === "startDate") {
        setFieldError("startDate", translateText(["overlapError"]));
      } else if (isCurrentEmployment && overlapType === "endDate") {
        setFieldError("startDate", translateText(["overlapError"]));
      } else if (!isCurrentEmployment && overlapType === "endDate") {
        setFieldError("endDate", translateText(["overlapError"]));
      }

      return;
    }

    if (isCurrentEmployment) {
      positions?.forEach((position, index) => {
        if (
          position.isCurrentEmployment &&
          startDate &&
          position?.startDate &&
          startDate > position?.startDate
        ) {
          positions[index] = {
            ...position,
            isCurrentEmployment: false,
            endDate: convertDateToFormat(
              new Date(newStartDate),
              LONG_DATE_TIME_FORMAT
            )
          };
        }
      });
    }

    if (rowEdited > -1) {
      positions[rowEdited] = {
        ...positions[rowEdited],
        ...values
      };
      setRowEdited(-1);
    } else {
      positions?.push(values);
    }
    positions?.sort(
      (a, b) =>
        new Date(b.startDate ?? "").getTime() -
        new Date(a.startDate ?? "").getTime()
    );

    setEmploymentDetails({
      ...employee.employment,
      careerProgression: positions
    });
    resetForm();
    setSelectedEndDate(undefined);
    setSelectedStartDate(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeCareerDetailsValidation(translateText),
    onSubmit,
    validateOnChange: false
  });

  const {
    copyOfEmployeeCareerDetails,
    checkOverlap,
    rowEdited,
    setRowEdited,
    setSelectedStartDate,
    setSelectedEndDate,
    handleInput,
    jobFamiliesList,
    jobTitleList,
    dateOnChange,
    selectedStartDate,
    selectedEndDate,
    handleCheckboxChange,
    setLatestRoleLabel,
    formatData,
    handleEdit,
    handleDelete,
    values,
    errors,
    resetForm,
    handleChange,
    setFieldValue,
    setFieldError,
    handleSubmit
  } = useCareerProgressionFormHandler({
    formik,
    isManager: isReadOnly,
    isProfileView
  });

  return (
    <PeopleFormSectionWrapper
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        fontFamily: "Poppins, sans-serif",
        display:
          (isReadOnly || isProfileView) &&
          employee?.employment?.careerProgression?.length === 0
            ? "none"
            : "block"
      }}
      dividerStyles={{
        mt: "0.5rem",
        display:
          (isReadOnly || isProfileView) &&
          employee?.employment?.careerProgression?.length === 0
            ? "none"
            : "block"
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
          {!isReadOnly && !isProfileView && (
            <>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <DropdownList
                  inputName="employmentType"
                  label={translateText(["employmentType"])}
                  value={values.employmentType}
                  placeholder={translateText(["enterEmploymentType"])}
                  onChange={handleChange}
                  onInput={handleInput}
                  error={errors.employmentType ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  errorFocusOutlineNeeded={false}
                  itemList={EmployeeTypesList}
                  checkSelected={true}
                  isDisabled={isInputsDisabled}
                  ariaLabel={translateAria(["selectEmploymentType"])}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                {jobFamiliesList?.length === 0 ? (
                  <InteractiveInputTrigger
                    id="add-new-job-title-button"
                    label={translateText(["jobFamily"])}
                    placeholder={translateText(["selectJobFamily"])}
                    componentStyle={{ mt: "0rem" }}
                    fieldButtonAction={() => {
                      setIsJobFamilyModalOpen(true);
                      setJobFamilyModalType(
                        JobFamilyActionModalEnums.ADD_JOB_FAMILY
                      );
                    }}
                  />
                ) : (
                  <DropdownList
                    inputName="jobFamilyId"
                    label={translateText(["jobFamily"])}
                    value={values.jobFamilyId ?? ""}
                    placeholder={translateText(["selectJobFamily"])}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("jobTitle", "");
                    }}
                    onInput={handleInput}
                    error={errors.jobFamilyId ?? ""}
                    componentStyle={{ mt: "0rem" }}
                    errorFocusOutlineNeeded={false}
                    itemList={jobFamiliesList}
                    checkSelected={true}
                    isDisabled={isInputsDisabled}
                    addNewClickBtnText={translateText(["addJobFamily"])}
                    onAddNewClickBtn={() => {
                      setIsJobFamilyModalOpen(true);
                      setJobFamilyModalType(
                        JobFamilyActionModalEnums.ADD_JOB_FAMILY
                      );
                    }}
                    ariaLabel={translateAria(["selectJobFamily"])}
                  />
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <DropdownList
                  label={translateText(["jobTitle"])}
                  inputName="jobTitleId"
                  placeholder={translateText(["selectJobTitle"])}
                  value={values.jobTitleId}
                  onChange={handleChange}
                  onInput={handleInput}
                  error={errors.jobTitleId ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  errorFocusOutlineNeeded={false}
                  itemList={jobTitleList}
                  isDisabled={!values?.jobFamilyId || isInputsDisabled}
                  checkSelected={true}
                  ariaLabel={translateAria(["selectJobTitle"])}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["startDate"])}
                  value={DateTime.fromISO(values.startDate ?? "")}
                  onchange={async (newValue: string) =>
                    await dateOnChange(
                      "startDate",
                      convertDateToFormat(
                        new Date(newValue),
                        LONG_DATE_TIME_FORMAT
                      )
                    )
                  }
                  placeholder={translateText(["selectStartDate"])}
                  error={errors.startDate ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  minDate={DateTime.fromISO(
                    employee?.employment?.employmentDetails?.joinedDate ?? ""
                  )}
                  inputFormat="dd/MM/yyyy"
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
                  onchange={async (newValue: string) =>
                    await dateOnChange(
                      "endDate",
                      convertDateToFormat(
                        new Date(newValue),
                        LONG_DATE_TIME_FORMAT
                      )
                    )
                  }
                  minDate={DateTime.fromISO(
                    values.startDate
                      ? values.startDate
                      : employee?.employment?.employmentDetails?.joinedDate
                        ? employee?.employment?.employmentDetails?.joinedDate
                        : ""
                  )}
                  placeholder={translateText(["selectEndDate"])}
                  error={errors.endDate ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  inputFormat="dd/MM/yyyy"
                  disabled={values.isCurrentEmployment || isInputsDisabled}
                  disableMaskedInput
                  selectedDate={selectedEndDate}
                  setSelectedDate={setSelectedEndDate}
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
                    endIcon={
                      rowEdited > -1 ? IconName.TICK_ICON : IconName.ADD_ICON
                    }
                    isFullWidth={false}
                    buttonStyle={ButtonStyle.SECONDARY}
                    size={ButtonSizes.MEDIUM}
                    styles={{
                      mt: "2rem"
                    }}
                    type={ButtonTypes.SUBMIT}
                    disabled={isInputsDisabled}
                  />
                )}
              </Grid>

              <Grid
                container
                alignItems="center"
                sx={{
                  mb: "-1rem"
                }}
                size={{ xs: 12, md: 6, xl: 4 }}
              >
                <Checkbox
                  checked={values.isCurrentEmployment}
                  onChange={handleCheckboxChange}
                  name="isCurrentEmployment"
                  color="primary"
                  sx={{
                    ml: "-0.5rem",
                    color: theme.palette.primary.main
                  }}
                  disabled={isInputsDisabled}
                  slotProps={{
                    input: {
                      "aria-label": translateAria([
                        "selectCurrentEmploymentChecked"
                      ])
                    }
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: isInputsDisabled ? theme.palette.text.disabled : ""
                  }}
                >
                  {translateText(["currentEmployment"])}
                </Typography>
              </Grid>
            </>
          )}
          {employee?.employment?.careerProgression?.length === 0 ||
          employee?.employment?.careerProgression === null ? null : (
            <PeopleFormTable
              data={formatData(copyOfEmployeeCareerDetails)}
              actionsNeeded={!isReadOnly && !isProfileView && !isInputsDisabled}
              onEdit={handleEdit}
              onDelete={handleDelete}
              headings={tableHeaders}
              tableStyles={{
                mt: "2rem"
              }}
              tableName={translateAria(["careerProgressionTable"])}
            />
          )}
        </Grid>
        <JobFamilyModalController
          setLatestRoleLabel={setLatestRoleLabel}
          from="add-new-resource"
        />
      </>
    </PeopleFormSectionWrapper>
  );
};

export default CareerProgressDetailsSection;
