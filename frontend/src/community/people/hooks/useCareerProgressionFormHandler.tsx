import { Box, SelectChangeEvent, Stack } from "@mui/material";
import { rejects } from "assert";
import { FormikProps } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { DropdownListType } from "~community/common/types/CommonTypes";
import {
  getJobLevelByJobLevelId,
  getJobLevelsByJobRoleId,
  getJobRoleByJobRoleId,
  getLabelByValue
} from "~community/common/utils/commonUtil";
import { getDateFromTimeStamp } from "~community/common/utils/dateTimeUtils";

import { useGetPreprocessedRoles } from "../api/PeopleApi";
import { usePeopleStore } from "../store/store";
import { JobFamilies } from "../types/JobRolesTypes";
import {
  L3CareerProgressionDetailsType,
  checkOverlapType
} from "../types/PeopleTypes";
import { calculateTenure } from "../utils/careerProgressUtils";
import { EmployeeTypesList } from "../utils/data/employeeSetupStaticData";

interface Props {
  formik: FormikProps<L3CareerProgressionDetailsType>;
  isManager?: boolean;
  isProfileView?: boolean;
}

const useCareerProgressionFormHandler = ({
  formik,
  isManager,
  isProfileView
}: Props) => {
  const {
    values,
    setFieldValue,
    setFieldError,
    resetForm,
    errors,
    handleChange,
    handleSubmit
  } = formik;

  const [jobTitle, setJobTitle] = useState<DropdownListType[]>([]);
  const [rowEdited, setRowEdited] = useState(-1);
  const [latestRoleLabel, setLatestRoleLabel] = useState<number>();
  const [selectedStartDate, setSelectedStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<DateTime | undefined>(
    undefined
  );

  const { employee, setEmploymentDetails } = usePeopleStore((state) => state);

  const getPreprocessedRoles = useGetPreprocessedRoles();

  const copyOfEmployeeCareerDetails = [
    ...(employee?.employment?.careerProgression || [])
  ];

  copyOfEmployeeCareerDetails?.sort(
    (a, b) =>
      new Date(b?.startDate ?? 0).getTime() -
      new Date(a?.startDate ?? 0).getTime()
  );

  let jobFamilies: JobFamilies[] = useMemo(() => {
    return [];
  }, []);

  const { data } = getPreprocessedRoles;

  jobFamilies = (data as JobFamilies[]) ?? [];

  const jobFamiliesList = useMemo(() => {
    return (
      jobFamilies?.map((jobFamily: JobFamilies) => ({
        label: jobFamily.name,
        value: jobFamily.jobFamilyId || ""
      })) ?? []
    );
  }, [jobFamilies]);

  const jobTitleList = useMemo(() => {
    if (!jobTitle || jobTitle.length === 0) {
      return [
        {
          label: "",
          value: ""
        }
      ];
    }

    return jobTitle.map((jobTitle) => ({
      label: jobTitle.label,
      value: jobTitle.value as number
    }));
  }, [jobTitle]);

  const formatData = (data: L3CareerProgressionDetailsType[]) => {
    if (!data) return [];

    return data?.map((position) => {
      let tenure;
      if (position?.isCurrentEmployment) {
        tenure = calculateTenure({
          startDate: position?.startDate as string,
          endDate: new Date().toISOString(),
          currentPosition: position?.isCurrentEmployment
        });
      } else {
        tenure = calculateTenure({
          startDate: position?.startDate as string,
          endDate: position?.endDate,
          currentPosition: position?.isCurrentEmployment
        });
      }
      return {
        isCurrentPosition: position?.isCurrentEmployment ? (
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
          position?.employmentType as string
        ),
        jobFamily: getJobRoleByJobRoleId(
          position?.jobFamilyId as number,
          jobFamilies
        ),
        jobTitle: getJobLevelByJobLevelId(
          position?.jobTitleId as number,
          jobFamilies
        ),
        startDate: position?.startDate?.split("T")[0],
        endDate: position?.endDate?.split("T")[0] ?? "-",
        tenure
      };
    });
  };

  const handleEdit = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const position = copyOfEmployeeCareerDetails[rowIndex];
    const {
      employmentType,
      jobFamilyId,
      jobTitleId,
      startDate,
      endDate,
      isCurrentEmployment
    } = position;
    void setFieldValue("employmentType", employmentType);
    void setFieldValue("jobFamilyId", jobFamilyId);
    void setFieldValue("jobTitleId", jobTitleId);
    void setFieldValue("startDate", startDate);
    void setFieldValue("endDate", endDate);
    void setFieldValue("isCurrentEmployment", isCurrentEmployment);
  };

  const handleDelete = (rowIndex: number) => {
    const updatedDetails = [...(copyOfEmployeeCareerDetails || [])];
    updatedDetails.splice(rowIndex, 1);
    setEmploymentDetails({
      ...employee.employment,
      careerProgression: updatedDetails
    });
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
      const { startDate, endDate, isCurrentEmployment } = position;
      const oldStartDate = new Date(
        getDateFromTimeStamp(startDate as string)
      )?.getTime();
      const oldEndDate = isCurrentEmployment
        ? new Date()?.getTime()
        : new Date(getDateFromTimeStamp(endDate as string))?.getTime();

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

  const handleInput = async (e: SelectChangeEvent) => {
    if (e.target.name === "jobFamilyId") {
      setFieldValue("jobTitleId", "");
    }
    await setFieldValue(e.target.name, e.target.value);
    setFieldError(e.target.name, "");
  };

  const handleCheckboxChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await setFieldValue(e.target.name, e.target.checked);
    await setFieldValue("endDate", "");
    setFieldError(e.target.name, "");
    if (e.target.checked) {
      setFieldError("endDate", "");
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
    if (values.jobFamilyId) {
      const jobTitle = getJobLevelsByJobRoleId(
        values?.jobFamilyId,
        jobFamilies
      );
      setJobTitle(jobTitle);
    }
  }, [values.jobFamilyId, jobFamilies]);

  useEffect(() => {
    if (latestRoleLabel !== null) {
      setFieldValue("jobFamilyId", latestRoleLabel).catch(rejects);
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

  return {
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
  };
};

export default useCareerProgressionFormHandler;
