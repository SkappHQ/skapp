import { SelectChangeEvent } from "@mui/material";
import { rejects } from "assert";
import { FormikProps } from "formik";
import { DateTime } from "luxon";
import React, {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import { useGetAllWorkLocations } from "~community/common/api/WorkLocationApi";
import useSessionData from "~community/common/hooks/useSessionData";
import { allowsAlphaNumericWithHyphenAndUnderscore } from "~community/common/regex/regexPatterns";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { filterByValue } from "~community/common/utils/commonUtil";
import { timeZonesList } from "~community/common/utils/data/timeZones";
import { usePeopleStore } from "~community/people/store/store";
import { L3EmploymentDetailsType } from "~community/people/types/PeopleTypes";
import { TeamNamesType } from "~community/people/types/TeamTypes";

import {
  useCheckEmailAndIdentificationNo,
  useGetSearchedEmployees
} from "../api/PeopleApi";
import { SystemPermissionTypes } from "../types/AddNewResourceTypes";
import { EmployeeDataType } from "../types/EmployeeTypes";
import {
  handleManagerSelect,
  onManagerRemove,
  onManagerSearchChange
} from "../utils/employmentManagerHandlingFunctions";

interface Props {
  formik: FormikProps<L3EmploymentDetailsType>;
  setIsUniqueEmail: (isUniqueEmail: boolean) => void;
  setIsUniqueEmployeeNo: (isUniqueEmployeeNo: boolean) => void;
  id?: string | string[];
  isManager?: boolean;
  isProfileView?: boolean;
}

const useEmployeeDetailsFormHandler = ({
  formik,
  setIsUniqueEmail,
  setIsUniqueEmployeeNo,
  id,
  isManager,
  isProfileView
}: Props) => {
  const { values, setFieldValue, setFieldError } = formik;

  const { employee, setEmploymentDetails, projectTeamNames } = usePeopleStore(
    (state) => state
  );

  const [isPrimaryManagerPopperOpen, setIsPrimaryManagerPopperOpen] =
    useState<boolean>(false);
  const [isSecondaryManagerPopperOpen, setIsSecondaryManagerPopperOpen] =
    useState<boolean>(false);

  const [primaryManagerSearchTerm, setPrimaryManagerSearchTerm] =
    useState<string>(
      employee?.employment?.employmentDetails?.primarySupervisor
        ?.firstName as string
    );
  const [secondaryManagerSearchTerm, setSecondaryManagerSearchTerm] =
    useState<string>(
      employee?.employment?.employmentDetails?.otherSupervisors?.[0]
        ?.firstName as string
    );

  const [selectedJoinedDate, setSelectedJoinedDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedProbationStartDate, setSelectedProbationStartDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedProbationEndDate, setSelectedProbationEndDate] = useState<
    DateTime | undefined
  >(undefined);

  const [latestTeamId, setLatestTeamId] = useState<number | null>();

  const getSearchedEmployeesByPrimaryManager = useGetSearchedEmployees(
    primaryManagerSearchTerm || "",
    SystemPermissionTypes.MANAGERS
  );

  const getSearchedEmployeesBySecondaryManager = useGetSearchedEmployees(
    secondaryManagerSearchTerm || "",
    SystemPermissionTypes.MANAGERS
  );

  const { isProTier } = useSessionData();

  const { data: workLocations } = useGetAllWorkLocations();

  const workTimeZoneDictionary: Record<string, string> = timeZonesList.reduce<
    Record<string, string>
  >((acc: Record<string, string>, curr: { value: string; label: string }) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {});

  const projectTeamList: DropdownListType[] = projectTeamNames?.map(
    (projectTeamName: TeamNamesType) => {
      return {
        label: projectTeamName.teamName,
        value: projectTeamName.teamId
      };
    }
  );

  const {
    data: checkEmailAndIdentificationNo,
    refetch,
    isSuccess
  } = useCheckEmailAndIdentificationNo(
    values.email as string,
    values.employeeNumber ?? ""
  );

  useEffect(() => {
    if (employee?.employment?.employmentDetails?.email !== values.email) {
      setFieldValue("email", employee?.employment?.employmentDetails?.email);
    }
  }, [employee?.employment?.employmentDetails?.email]);

  const handleInput = async (
    e: ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;

    if (
      name === "employeeNumber" &&
      (value === "" || allowsAlphaNumericWithHyphenAndUnderscore().test(value))
    ) {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setEmploymentDetails({
        employmentDetails: {
          ...employee?.employment?.employmentDetails,
          [name]: value
        } as L3EmploymentDetailsType
      });
    } else if (name === "email") {
      await setFieldValue(name, value);
      setFieldError(name, "");
      setEmploymentDetails({
        employmentDetails: {
          ...employee?.employment?.employmentDetails,
          [name]: value
        }
      });
    }
  };

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ) => {
    await setFieldValue(e.target.name, e.target.value);
    setFieldError(e.target.name, "");
    setEmploymentDetails({
      employmentDetails: {
        ...employee?.employment?.employmentDetails,
        [e.target.name]: e.target.value
      } as L3EmploymentDetailsType
    });
  };

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    await setFieldValue(fieldName, newValue);
    setEmploymentDetails({
      employmentDetails: {
        ...employee?.employment?.employmentDetails,
        [fieldName]: newValue
      } as L3EmploymentDetailsType
    });
    setFieldError(fieldName, "");
  };

  const handleWorkTimeZoneChange = async (
    e: SyntheticEvent,
    value: DropdownListType
  ): Promise<void> => {
    setFieldError("workTimeZone", "");
    await setFieldValue("workTimeZone", value.value);
    setEmploymentDetails({
      employmentDetails: {
        ...employee?.employment?.employmentDetails,
        workTimeZone: value.value as string
      } as L3EmploymentDetailsType
    });
  };

  const handleWorkLocationChange = async (
    e: SyntheticEvent,
    value: DropdownListType
  ): Promise<void> => {
    const workLocationId = Number(value.value);
    setFieldError("workLocationId", "");
    await setFieldValue("workLocationId", workLocationId);
    setEmploymentDetails({
      employmentDetails: {
        ...employee?.employment?.employmentDetails,
        workLocationId: workLocationId
      } as L3EmploymentDetailsType
    });
  };

  const handleTeamSelect = useCallback(
    async (newValue: number[]): Promise<void> => {
      await setFieldValue("teamIds", newValue);
      setEmploymentDetails({
        employmentDetails: {
          ...employee?.employment?.employmentDetails, // Make sure to spread the existing values
          teamIds: newValue
        } as L3EmploymentDetailsType
      });
      setFieldError("teamIds", "");
    },
    [
      employee?.employment?.employmentDetails,
      setEmploymentDetails,
      setFieldError,
      setFieldValue
    ]
  );

  const onPrimaryManagerSearchChange = async (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): Promise<void> => {
    await onManagerSearchChange({
      managerType: "primarySupervisor",
      searchTerm: e.target.value.trimStart(),
      setManagerSearchTerm: setPrimaryManagerSearchTerm,
      formik,
      setSupervisor: setEmploymentDetails,
      isProTier
    });
  };

  const onSecondaryManagerSearchChange = async (
    e?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchTerm?: string
  ): Promise<void> => {
    const term =
      searchTerm !== undefined ? searchTerm : e?.target?.value?.trimStart();

    await onManagerSearchChange({
      managerType: "otherSupervisors",
      searchTerm: term as string,
      setManagerSearchTerm: setSecondaryManagerSearchTerm,
      formik,
      setSupervisor: setEmploymentDetails,
      isProTier
    });
  };

  let primaryManagers: EmployeeDataType[] = [];
  let secondaryManagers: EmployeeDataType[] = [];
  let isPrimaryManagersLoading: boolean = false;
  let isSecondaryManagersLoading: boolean = false;

  if (!isManager && !isProfileView) {
    ({ data: primaryManagers as any, isLoading: isPrimaryManagersLoading } =
      getSearchedEmployeesByPrimaryManager);
  }

  if (!isManager && !isProfileView) {
    ({ data: secondaryManagers as any, isLoading: isSecondaryManagersLoading } =
      getSearchedEmployeesBySecondaryManager);
  }

  const getSuggestions = (managerList: EmployeeDataType[]) => {
    let newManagerList = managerList;

    if (id) {
      newManagerList = filterByValue(newManagerList, id, "employeeId");
    }

    if (
      employee?.employment?.employmentDetails?.primarySupervisor?.employeeId
    ) {
      newManagerList = filterByValue(
        newManagerList,
        employee?.employment?.employmentDetails?.primarySupervisor?.employeeId,
        "employeeId"
      );
    }
    if (employee?.employment?.employmentDetails?.otherSupervisors?.length) {
      // Filter out all manager IDs from the otherSupervisors array
      employee?.employment?.employmentDetails?.otherSupervisors.forEach(
        (supervisor) => {
          if (supervisor.employeeId) {
            newManagerList = filterByValue(
              newManagerList,
              supervisor.employeeId,
              "employeeId"
            );
          }
        }
      );
    }

    if (
      employee?.employment?.employmentDetails?.primarySupervisor?.employeeId
    ) {
      newManagerList = newManagerList?.filter(
        (manager) =>
          String(manager?.employeeId) !==
          String(
            employee?.employment?.employmentDetails?.primarySupervisor
              ?.employeeId
          )
      );
    }

    return newManagerList;
  };

  const primaryManagerSuggestions: EmployeeDataType[] = getSuggestions(
    !isPrimaryManagersLoading ? primaryManagers : []
  );

  const secondaryManagerSuggestions: EmployeeDataType[] = getSuggestions(
    !isSecondaryManagersLoading ? secondaryManagers : []
  );

  const handlePrimaryManagerSelect = async (
    user: EmployeeDataType
  ): Promise<void> => {
    await handleManagerSelect({
      user,
      fieldName: "primarySupervisor",
      formik,
      searchTermSetter: setPrimaryManagerSearchTerm,
      setSupervisor: setEmploymentDetails,
      setIsPopperOpen: setIsPrimaryManagerPopperOpen
    });
  };

  const handlePrimaryManagerRemove = async (): Promise<void> => {
    await onManagerRemove({
      fieldName: "primarySupervisor",
      formik,
      searchTermSetter: setPrimaryManagerSearchTerm,
      setSupervisor: setEmploymentDetails
    });
    formik?.values?.otherSupervisors &&
      (await onManagerRemove({
        fieldName: "otherSupervisors",
        formik,
        searchTermSetter: setSecondaryManagerSearchTerm,
        setSupervisor: setEmploymentDetails
      }));
  };

  const handleSecondaryManagerSelect = async (
    user: EmployeeDataType
  ): Promise<void> => {
    await handleManagerSelect({
      user,
      fieldName: "otherSupervisors",
      formik,
      searchTermSetter: setSecondaryManagerSearchTerm,
      setSupervisor: setEmploymentDetails,
      setIsPopperOpen: setIsSecondaryManagerPopperOpen
    });
  };

  const handleSecondaryManagerRemove = async (): Promise<void> => {
    await onManagerRemove({
      fieldName: "otherSupervisors",
      formik,
      searchTermSetter: setSecondaryManagerSearchTerm,
      setSupervisor: setEmploymentDetails
    });
  };

  useEffect(() => {
    if (isManager || isProfileView) {
      setIsUniqueEmail(true);
      setIsUniqueEmployeeNo(true);
    }
  }, [isManager, isProfileView]);

  useEffect(() => {
    const updatedData = checkEmailAndIdentificationNo;
    if (updatedData && isSuccess && !isProfileView && !isManager) {
      if (updatedData.isWorkEmailExists && !formik.touched.email) {
        setIsUniqueEmail(false);
      } else {
        setIsUniqueEmail(true);
      }

      if (
        updatedData.isIdentificationNoExists &&
        !formik.touched.employeeNumber &&
        formik.initialValues.employeeNumber !== values?.employeeNumber
      ) {
        setIsUniqueEmployeeNo(false);
      } else {
        setIsUniqueEmployeeNo(true);
      }
    }
  }, [
    checkEmailAndIdentificationNo,
    isSuccess,
    formik.touched.email,
    formik.touched.employeeNumber,
    formik.errors
  ]);

  useEffect(() => {
    setIsPrimaryManagerPopperOpen(false);
    setIsSecondaryManagerPopperOpen(false);
  }, []);

  useEffect(() => {
    if (latestTeamId !== null && latestTeamId !== undefined) {
      handleTeamSelect([
        ...(employee?.employment?.employmentDetails?.teamIds ?? []),
        latestTeamId
      ]).catch(rejects);
      setLatestTeamId(null);
    }
  }, [
    latestTeamId,
    handleTeamSelect,
    employee?.employment?.employmentDetails?.teamIds
  ]);

  useEffect(() => {
    if (!isManager && !isProfileView) {
      void refetch();
    }
  }, [values.email, values.employeeNumber]);

  useEffect(() => {
    if (values.joinedDate) {
      const joinedDateTime = DateTime.fromISO(values.joinedDate);
      setSelectedJoinedDate(joinedDateTime);
    } else {
      setSelectedJoinedDate(undefined);
    }
    if (values.probationStartDate) {
      const probationStartDateTime = DateTime.fromISO(
        values.probationStartDate
      );
      setSelectedProbationStartDate(probationStartDateTime);
    } else {
      setSelectedProbationStartDate(undefined);
    }
    if (values.probationEndDate) {
      const probationEndDateTime = DateTime.fromISO(values.probationEndDate);
      setSelectedProbationEndDate(probationEndDateTime);
    } else {
      setSelectedProbationEndDate(undefined);
    }
  }, [values]);

  useEffect(() => {
    const primarySupervisor = formik?.values?.primarySupervisor;
    const hasSecondarySupervisor =
      formik?.values?.otherSupervisors?.[0]?.employeeId;

    if (!primarySupervisor?.employeeId && hasSecondarySupervisor) {
      onManagerRemove({
        fieldName: "otherSupervisors",
        formik,
        searchTermSetter: setSecondaryManagerSearchTerm,
        setSupervisor: setEmploymentDetails
      });
    }
  }, [formik?.values?.primarySupervisor]);

  const handleBackspacePressPrimary = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      setPrimaryManagerSearchTerm("");
      setEmploymentDetails({
        employmentDetails: {
          ...employee?.employment?.employmentDetails,
          primarySupervisor: {}
        }
      });
    }
  };

  const handleBackspacePressSecondary = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      setSecondaryManagerSearchTerm("");
      setEmploymentDetails({
        employmentDetails: {
          ...employee?.employment?.employmentDetails,
          otherSupervisors: []
        }
      });
    }
  };

  return {
    isPrimaryManagerPopperOpen,
    isSecondaryManagerPopperOpen,
    selectedJoinedDate,
    selectedProbationStartDate,
    selectedProbationEndDate,
    workTimeZoneDictionary,
    workLocations,
    projectTeamList,
    primaryManagerSearchTerm,
    secondaryManagerSearchTerm,
    primaryManagerSuggestions,
    secondaryManagerSuggestions,
    isSecondaryManagersLoading,
    setIsSecondaryManagerPopperOpen,
    setIsPrimaryManagerPopperOpen,
    setSelectedProbationStartDate,
    setSelectedProbationEndDate,
    setSelectedJoinedDate,
    setLatestTeamId,
    handleTeamSelect,
    handleInput,
    handleChange,
    dateOnChange,
    handleWorkTimeZoneChange,
    handleWorkLocationChange,
    onPrimaryManagerSearchChange,
    onSecondaryManagerSearchChange,
    handlePrimaryManagerSelect,
    handlePrimaryManagerRemove,
    handleSecondaryManagerSelect,
    handleSecondaryManagerRemove,
    refetch,
    handleBackspacePressPrimary,
    handleBackspacePressSecondary,
    setSecondaryManagerSearchTerm
  };
};

export default useEmployeeDetailsFormHandler;
