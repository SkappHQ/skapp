import {
  Box,
  Checkbox,
  Grid2 as Grid,
  type SelectChangeEvent,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { rejects } from "assert";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import CustomTable from "~community/common/components/molecules/CustomTable/CustomTable";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InteractiveInputTrigger from "~community/common/components/molecules/InteractiveInputTrigger/InteractiveInputTrigger";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { APP_FONT_FAMILY } from "~community/common/constants/configs";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  getJobLevelByJobLevelId,
  getJobLevelsByJobRoleId,
  getJobRoleByJobRoleId,
  getLabelByValue
} from "~community/common/utils/commonUtil";
import {
  convertDateToFormat,
  getDateFromTimeStamp
} from "~community/common/utils/dateTimeUtils";
import { useGetPreprocessedRoles } from "~community/people/api/PeopleApi";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import {
  EmploymentTypes,
  PositionDetailsType
} from "~community/people/types/AddNewResourceTypes";
import { JobFamilies } from "~community/people/types/JobRolesTypes";
import { EmployeeTypesList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeCareerDetailsValidation } from "~community/people/utils/peopleValidations";

import JobFamilyModalController from "../../JobFamilyModalController/JobFamilyModalController";

interface checkOverlapType {
  positions: PositionDetailsType[];
  newStartDate: number;
  newEndDate: number | null;
  newCurrentPosition: boolean;
}

interface tenureType {
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
}

interface Props {
  isManager?: boolean;
  isProfileView?: boolean;
  isInputsDisabled?: boolean;
}

const CareerProgressionDetailsSection = ({
  isManager = false,
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
  const {
    employeeCareerDetails,
    employeeProfileDetails,
    setEmployeeCareerDetails,
    setIsJobFamilyModalOpen,
    setJobFamilyModalType,
    employeeEmploymentDetails
  } = usePeopleStore((state) => state);

  const [jobLevels, setJobLevels] = useState<DropdownListType[]>([]);
  const [rowEdited, setRowEdited] = useState(-1);
  const [latestRoleLabel, setLatestRoleLabel] = useState<number>();
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );
  const getPreprocessedRoles = useGetPreprocessedRoles();
  const copyOfData = [...(employeeCareerDetails?.positionDetails || [])];
  copyOfData?.sort(
    (a, b) =>
      new Date(b?.startDate)?.getTime() - new Date(a?.startDate)?.getTime()
  );

  const copyOfEmployeeCareerDetails = [
    ...(employeeProfileDetails?.careerDetails || [])
  ];
  copyOfEmployeeCareerDetails?.sort(
    (a, b) =>
      new Date(b?.startDate)?.getTime() - new Date(a?.startDate)?.getTime()
  );

  let jobFamilies: JobFamilies[] = useMemo(() => {
    return [];
  }, []);

  if (!isManager && !isProfileView) {
    const { data } = getPreprocessedRoles;
    jobFamilies = (data as JobFamilies[]) ?? [];
  }

  const jobFamiliesList = useMemo(() => {
    return (
      jobFamilies?.map((jobFamily: JobFamilies) => ({
        label: jobFamily.name,
        value: jobFamily.jobFamilyId || ""
      })) ?? []
    );
  }, [jobFamilies]);

  const jobLevelsList = useMemo(() => {
    if (!jobLevels || jobLevels.length === 0) {
      return [
        {
          label: "",
          value: ""
        }
      ];
    }

    return jobLevels.map((jobLevel) => ({
      label: jobLevel.label,
      value: jobLevel.value as number
    }));
  }, [jobLevels]);

  const initialValues = {
    employeeType: "" as EmploymentTypes | "",
    jobFamily: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    currentPosition: false
  };

  const formatData = (data: PositionDetailsType[]) => {
    if (!data) return [];

    const calculateTenure = ({
      startDate,
      endDate,
      currentPosition
    }: tenureType) => {
      const start = DateTime.fromISO(startDate);
      const end = currentPosition
        ? DateTime.now()
        : DateTime.fromISO(endDate ?? "");

      const diff = end.diff(start, ["years", "months"]);

      const years = Math.floor(diff.years);
      const months = Math.floor(diff.months);

      const tenureYears = Math.max(years, 0);
      const tenureMonths = Math.max(months, 0);

      return tenureYears > 0
        ? `${tenureYears}y ${tenureMonths}m`
        : `${tenureMonths}m`;
    };

    return data?.map((position) => {
      let tenure;
      if (position?.currentPosition) {
        tenure = calculateTenure({
          startDate: position?.startDate,
          endDate: new Date().toISOString(),
          currentPosition: position?.currentPosition
        });
      } else {
        tenure = calculateTenure({
          startDate: position?.startDate,
          endDate: position?.endDate,
          currentPosition: position?.currentPosition
        });
      }
      return {
        isCurrentPosition: position?.currentPosition ? (
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                backgroundColor: "#62B794"
              }}
            />
          </Stack>
        ) : (
          <Stack />
        ),
        employeeType: getLabelByValue(
          EmployeeTypesList,
          position?.employeeType
        ),
        jobFamily:
          !isManager && !isProfileView
            ? getJobRoleByJobRoleId(position?.jobFamily, jobFamilies)
            : position?.jobFamily,
        jobTitle:
          !isManager && !isProfileView
            ? getJobLevelByJobLevelId(position?.jobTitle, jobFamilies)
            : position?.jobTitle,
        startDate: position?.startDate?.split("T")[0],
        endDate: position?.endDate?.split("T")[0] ?? "-",
        tenure
      };
    });
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

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const position = copyOfData[rowIndex];
    const {
      employeeType,
      jobFamily,
      jobTitle,
      startDate,
      endDate,
      currentPosition
    } = position;
    void setFieldValue("employeeType", employeeType);
    void setFieldValue("jobFamily", jobFamily);
    void setFieldValue("jobTitle", jobTitle);
    void setFieldValue("startDate", startDate);
    void setFieldValue("endDate", endDate);
    void setFieldValue("currentPosition", currentPosition);
  };

  const handleDelete = (rowIndex: number) => {
    const updatedDetails = [...(copyOfData || [])];
    updatedDetails.splice(rowIndex, 1);
    setEmployeeCareerDetails(updatedDetails);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
      setSelectedEndDate(undefined);
      setSelectedStartDate(undefined);
    }
  };

  const checkOverlap = ({
    positions,
    newStartDate,
    newEndDate,
    newCurrentPosition
  }: checkOverlapType) => {
    let hasOverlap = false;
    let overlapType = "";

    positions?.forEach((position, index) => {
      if (index === rowEdited) {
        return;
      }
      const { startDate, endDate, currentPosition } = position;
      const oldStartDate = new Date(getDateFromTimeStamp(startDate))?.getTime();
      const oldEndDate = currentPosition
        ? new Date()?.getTime()
        : new Date(getDateFromTimeStamp(endDate))?.getTime();

      if (
        !newCurrentPosition &&
        newEndDate &&
        newStartDate < oldEndDate &&
        oldStartDate < newEndDate
      ) {
        hasOverlap = true;
        overlapType =
          newStartDate >= oldStartDate && newStartDate < oldEndDate
            ? "startDate"
            : "endDate";
      } else if (newCurrentPosition && newStartDate <= oldStartDate) {
        hasOverlap = true;
        overlapType = "startDate";
      }
    });

    return { hasOverlap, overlapType };
  };

  const onSubmit = (values: PositionDetailsType) => {
    const positions = copyOfData || [];
    const { startDate, endDate, currentPosition } = values;

    const newStartDate = new Date(getDateFromTimeStamp(startDate))?.getTime();
    const newEndDate = currentPosition
      ? new Date()?.getTime()
      : new Date(getDateFromTimeStamp(endDate))?.getTime();

    const { hasOverlap, overlapType } = checkOverlap({
      positions,
      newStartDate,
      newEndDate,
      newCurrentPosition: currentPosition
    });

    if (hasOverlap) {
      if (overlapType === "startDate") {
        setFieldError("startDate", translateText(["overlapError"]));
      } else if (currentPosition && overlapType === "endDate") {
        setFieldError("startDate", translateText(["overlapError"]));
      } else if (!currentPosition && overlapType === "endDate") {
        setFieldError("endDate", translateText(["overlapError"]));
      }

      return;
    }

    if (currentPosition) {
      positions?.forEach((position, index) => {
        if (position.currentPosition && startDate > position.startDate) {
          positions[index] = {
            ...position,
            currentPosition: false,
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
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    setEmployeeCareerDetails(positions);
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
    values,
    errors,
    handleSubmit,
    handleChange,
    resetForm,
    setFieldValue,
    setFieldError
  } = formik;

  const handleInput = async (e: SelectChangeEvent) => {
    await setFieldValue(e.target.name, e.target.value);
    setFieldError(e.target.name, "");
  };

  const handleCheckboxChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await setFieldValue(e.target.name, e.target.checked);
    await setFieldValue("endDate", "");
    setFieldError(e.target.name, "");
  };

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    await setFieldValue(fieldName, newValue);
    setFieldError(fieldName, "");
  };

  useEffect(() => {
    if (values.jobFamily) {
      const jobLevels = getJobLevelsByJobRoleId(values?.jobFamily, jobFamilies);
      setJobLevels(jobLevels);
    }
  }, [values.jobFamily, jobFamilies]);

  useEffect(() => {
    if (latestRoleLabel !== null) {
      setFieldValue("jobFamily", latestRoleLabel).catch(rejects);
      getPreprocessedRoles.refetch();
    }
  }, [latestRoleLabel]);

  useEffect(() => {
    if (values.startDate) {
      const startDateTime = DateTime.fromISO(values.startDate);
      setSelectedStartDate(startDateTime);
    } else {
      setSelectedStartDate(undefined);
    }
    if (values.endDate) {
      const endDateTime = DateTime.fromISO(values.endDate);
      setSelectedEndDate(endDateTime);
    } else {
      setSelectedEndDate(undefined);
    }
  }, [values]);

  return (
    <PeopleLayout
      title={translateText(["title"])}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        fontFamily: APP_FONT_FAMILY,
        display:
          (isManager || isProfileView) &&
          employeeCareerDetails?.positionDetails?.length === 0
            ? "none"
            : "block"
      }}
      dividerStyles={{
        mt: "0.5rem",
        display:
          (isManager || isProfileView) &&
          employeeCareerDetails?.positionDetails?.length === 0
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
          {!isManager && !isProfileView && (
            <>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <DropdownList
                  inputName="employeeType"
                  label={translateText(["employmentType"])}
                  value={values.employeeType}
                  placeholder={translateText(["enterEmploymentType"])}
                  onChange={handleChange}
                  onInput={handleInput}
                  error={errors.employeeType ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  errorFocusOutlineNeeded={false}
                  itemList={EmployeeTypesList}
                  checkSelected={true}
                  isDisabled={isInputsDisabled}
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
                    inputName="jobFamily"
                    label={translateText(["jobFamily"])}
                    value={values.jobFamily ?? ""}
                    placeholder={translateText(["selectJobFamily"])}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("jobTitle", "");
                    }}
                    onInput={handleInput}
                    error={errors.jobFamily ?? ""}
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
                  />
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <DropdownList
                  label={translateText(["jobTitle"])}
                  inputName="jobTitle"
                  placeholder={translateText(["selectJobTitle"])}
                  value={values.jobTitle}
                  onChange={handleChange}
                  onInput={handleInput}
                  error={errors.jobTitle ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  errorFocusOutlineNeeded={false}
                  itemList={jobLevelsList}
                  isDisabled={!values?.jobFamily || isInputsDisabled}
                  checkSelected={true}
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
                    employeeEmploymentDetails?.joinedDate ?? ""
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
                      : employeeEmploymentDetails?.joinedDate
                        ? employeeEmploymentDetails?.joinedDate
                        : ""
                  )}
                  placeholder={translateText(["selectEndDate"])}
                  error={errors.endDate ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  inputFormat="dd/MM/yyyy"
                  disabled={values.currentPosition || isInputsDisabled}
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
                  checked={values.currentPosition}
                  onChange={handleCheckboxChange}
                  name="currentPosition"
                  color="primary"
                  sx={{
                    ml: "-0.5rem",
                    color: theme.palette.primary.main
                  }}
                  disabled={isInputsDisabled}
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
          {employeeCareerDetails?.positionDetails.length === 0 ? null : (
            <CustomTable
              data={
                !isManager && !isProfileView
                  ? formatData(copyOfData)
                  : formatData(copyOfEmployeeCareerDetails)
              }
              actionsNeeded={!isManager && !isProfileView && !isInputsDisabled}
              onEdit={handleEdit}
              onDelete={handleDelete}
              headings={tableHeaders}
              tableStyles={{
                mt: "2rem"
              }}
            />
          )}
        </Grid>
        <JobFamilyModalController
          setLatestRoleLabel={setLatestRoleLabel}
          from="add-new-resource"
        />
      </>
    </PeopleLayout>
  );
};

export default CareerProgressionDetailsSection;
