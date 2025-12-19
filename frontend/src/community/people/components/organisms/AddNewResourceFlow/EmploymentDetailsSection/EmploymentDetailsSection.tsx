import { Grid2 as Grid, SelectChangeEvent, type Theme } from "@mui/material";
import { useTheme } from "@mui/system";
import { rejects } from "assert";
import { type FormikErrors, useFormik } from "formik";
import { DateTime } from "luxon";
import { useAuth } from "~community/common/context/AuthContext";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from "react";

import AvatarSearch from "~community/common/components/molecules/AvatarSearch/AvatarSearch";
import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InteractiveInputTrigger from "~community/common/components/molecules/InteractiveInputTrigger/InteractiveInputTrigger";
import MultiSelectChipInput from "~community/common/components/molecules/MultiSelectChipInput";
import MultivalueDropdownList from "~community/common/components/molecules/MultiValueDropdownList/MultivalueDropdownList";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { allowsAlphaNumericWithHyphenAndUnderscore } from "~community/common/regex/regexPatterns";
import { ManagerTypes } from "~community/common/types/AuthTypes";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { filterByValue } from "~community/common/utils/commonUtil";
import { timeZonesList } from "~community/common/utils/data/timeZones";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { isValidEmailPattern } from "~community/common/utils/validation";
import {
  useCheckEmailAndIdentificationNo,
  useGetSearchedEmployees
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  EmployeeEmploymentDetailsFormTypes,
  EmploymentAllocationTypes,
  SystemPermissionTypes
} from "~community/people/types/AddNewResourceTypes";
import {
  EmployeeDataType,
  EmployeeEmploymentContextType,
  EmploymentStatusTypes
} from "~community/people/types/EmployeeTypes";
import {
  TeamModelTypes,
  TeamNamesType
} from "~community/people/types/TeamTypes";
import {
  handleManagerSelect,
  onManagerRemove,
  onManagerSearchChange
} from "~community/people/utils/addNewResourceFunctions";
import { EmployementAllocationList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeEmploymentDetailsValidation } from "~community/people/utils/peopleValidations";

import TeamModalController from "../../TeamModalController/TeamModalController";

interface Props {
  isManager?: boolean;
  isUpdate?: boolean;
  isProfileView?: boolean;
  isInputsDisabled?: boolean;
  isEmployee?: boolean;
}

interface FormMethods {
  validateForm: () => Promise<FormikErrors<EmployeeEmploymentDetailsFormTypes>>;
  submitForm: () => void;
  resetForm: () => void;
}

const EmploymentDetailsSection = forwardRef<FormMethods, Props>(
  (
    {
      isManager = false,
      isUpdate = false,
      isProfileView = false,
      isInputsDisabled = false,
      isEmployee = false
    }: Props,
    ref
  ) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "employmentDetails"
    );
    const {
      projectTeamNames,
      employeeEmploymentDetails,
      setEmployeeEmploymentDetails,
      setTeamModalType,
      setIsTeamModalOpen,
      employeeDataChanges
    } = usePeopleStore((state) => state);
    const router = useRouter();
    const { id } = router.query;

    const { data } = useAuth();

    const isAdmin = data?.user.roles?.includes(ManagerTypes.PEOPLE_MANAGER);

    const [isUniqueEmail, setIsUniqueEmail] = useState<boolean>(false);
    const [isUniqueEmployeeNo, setIsUniqueEmployeeNo] =
      useState<boolean>(false);

    const [isPrimaryManagerPopperOpen, setIsPrimaryManagerPopperOpen] =
      useState<boolean>(false);
    const [isSecondaryManagerPopperOpen, setIsSecondaryManagerPopperOpen] =
      useState<boolean>(false);

    const [primaryManagerSearchTerm, setPrimaryManagerSearchTerm] =
      useState<string>(employeeEmploymentDetails?.primarySupervisor?.firstName);
    const [secondaryManagerSearchTerm, setSecondaryManagerSearchTerm] =
      useState<string>(
        employeeEmploymentDetails?.secondarySupervisor?.firstName
      );
    const [selectedJoinedDate, setSelectedJoinedDate] = useState<
      DateTime | undefined
    >(undefined);
    const [selectedProbationStartDate, setSelectedProbationStartDate] =
      useState<DateTime | undefined>(undefined);
    const [selectedProbationEndDate, setSelectedProbationEndDate] = useState<
      DateTime | undefined
    >(undefined);
    const theme: Theme = useTheme();

    const getSearchedEmployeesByPrimaryManager = useGetSearchedEmployees(
      primaryManagerSearchTerm || "",
      SystemPermissionTypes.MANAGERS
    );

    const getSearchedEmployeesBySecondaryManager = useGetSearchedEmployees(
      secondaryManagerSearchTerm || "",
      SystemPermissionTypes.MANAGERS
    );

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

    const [latestTeamId, setLatestTeamId] = useState<number | null>();

    const { isPendingInvitationListOpen } = usePeopleStore((state) => state);

    const initialValues: EmployeeEmploymentDetailsFormTypes = useMemo(
      () => ({
        employeeNumber: employeeEmploymentDetails?.employeeNumber || "",
        workEmail: employeeEmploymentDetails?.workEmail || "",
        employmentAllocation:
          employeeEmploymentDetails?.employmentAllocation ||
          ("" as EmploymentAllocationTypes | ""),
        employmentStatus:
          employeeEmploymentDetails.employmentStatus ||
          EmploymentStatusTypes.PENDING,
        teams: employeeEmploymentDetails?.teams || [],
        primarySupervisor: employeeEmploymentDetails?.primarySupervisor || {
          employeeId: "",
          firstName: "",
          lastName: "",
          avatarUrl: ""
        },
        secondarySupervisor: employeeEmploymentDetails?.secondarySupervisor || {
          employeeId: "",
          firstName: "",
          lastName: "",
          avatarUrl: ""
        },
        joinedDate: employeeEmploymentDetails?.joinedDate || "",
        probationStartDate: employeeEmploymentDetails?.probationStartDate || "",
        probationEndDate: employeeEmploymentDetails?.probationEndDate || "",
        workTimeZone: employeeEmploymentDetails?.workTimeZone || ""
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [employeeDataChanges]
    );

    const onSubmit = async (): Promise<void> => {
      setIsPrimaryManagerPopperOpen(false);
      setIsSecondaryManagerPopperOpen(false);
      await refetch();
    };

    const context: EmployeeEmploymentContextType = {
      isUniqueEmail,
      isUniqueEmployeeNo,
      isUpdate:
        initialValues?.workEmail !== employeeEmploymentDetails?.workEmail
          ? false
          : isUpdate
    };

    const formik = useFormik<EmployeeEmploymentDetailsFormTypes>({
      initialValues,
      validationSchema: employeeEmploymentDetailsValidation(
        context,
        translateText
      ),
      onSubmit,
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const validationErrors = await formik.validateForm();
        return validationErrors;
      },
      submitForm: async () => {
        await formik.submitForm();
      },
      resetForm: async () => {
        formik.resetForm();
        setSelectedJoinedDate(undefined);
        setSelectedProbationEndDate(undefined);
        setSelectedProbationStartDate(undefined);
      }
    }));

    const { values, errors, setFieldValue, setFieldError } = formik;
    const {
      data: checkEmailAndIdentificationNo,
      refetch,
      isSuccess
    } = useCheckEmailAndIdentificationNo(
      values.workEmail,
      values.employeeNumber
    );

    useEffect(() => {
      if (employeeEmploymentDetails.workEmail !== values.workEmail) {
        setFieldValue("workEmail", employeeEmploymentDetails.workEmail);
      }
    }, [employeeEmploymentDetails]);

    const handleInput = async (
      e: ChangeEvent<HTMLInputElement> | SelectChangeEvent
    ) => {
      const { name, value } = e.target;

      if (
        name === "employeeNumber" &&
        (value === "" ||
          allowsAlphaNumericWithHyphenAndUnderscore().test(value))
      ) {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmployeeEmploymentDetails(name, value);
      } else if (
        name === "workEmail" &&
        (value === "" || isValidEmailPattern(value))
      ) {
        await setFieldValue(name, value);
        setFieldError(name, "");
        setEmployeeEmploymentDetails(name, value);
      }
    };

    const handleChange = async (
      e: ChangeEvent<HTMLInputElement> | SelectChangeEvent
    ) => {
      await setFieldValue(e.target.name, e.target.value);
      setFieldError(e.target.name, "");
      setEmployeeEmploymentDetails(e.target.name, e.target.value);
    };

    const dateOnChange = async (
      fieldName: string,
      newValue: string
    ): Promise<void> => {
      await setFieldValue(fieldName, newValue);
      setEmployeeEmploymentDetails(fieldName, newValue);
      setFieldError(fieldName, "");
    };

    const handleWorkTimeZoneChange = async (
      e: SyntheticEvent,
      value: DropdownListType
    ): Promise<void> => {
      setFieldError("workTimeZone", "");
      await setFieldValue("workTimeZone", value.value);
      setEmployeeEmploymentDetails("workTimeZone", value.value);
    };

    const handleTeamSelect = useCallback(
      async (newValue: number[]): Promise<void> => {
        if (newValue !== undefined) {
          await setFieldValue("teams", newValue);
          setEmployeeEmploymentDetails("teams", newValue);
          setFieldError("teams", "");
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const onPrimaryManagerSearchChange = async (
      e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): Promise<void> => {
      await onManagerSearchChange({
        managerType: "primarySupervisor",
        e,
        setManagerSearchTerm: setPrimaryManagerSearchTerm,
        formik,
        setSupervisor: setEmployeeEmploymentDetails
      });
    };

    const onSecondaryManagerSearchChange = async (
      e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): Promise<void> => {
      await onManagerSearchChange({
        managerType: "secondarySupervisor",
        e,
        setManagerSearchTerm: setSecondaryManagerSearchTerm,
        formik,
        setSupervisor: setEmployeeEmploymentDetails
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
      ({
        data: secondaryManagers as any,
        isLoading: isSecondaryManagersLoading
      } = getSearchedEmployeesBySecondaryManager);
    }

    const getSuggestions = (managerList: EmployeeDataType[]) => {
      let newManagerList = managerList;

      if (id) {
        newManagerList = filterByValue(newManagerList, id, "employeeId");
      }

      if (employeeEmploymentDetails.primarySupervisor?.employeeId) {
        newManagerList = filterByValue(
          newManagerList,
          employeeEmploymentDetails.primarySupervisor?.employeeId,
          "employeeId"
        );
      }
      if (employeeEmploymentDetails.secondarySupervisor?.employeeId) {
        newManagerList = filterByValue(
          newManagerList,
          employeeEmploymentDetails.secondarySupervisor?.employeeId,
          "employeeId"
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
        setSupervisor: setEmployeeEmploymentDetails,
        setIsPopperOpen: setIsPrimaryManagerPopperOpen
      });
    };

    const handlePrimaryManagerRemove = async (): Promise<void> => {
      await onManagerRemove({
        fieldName: "primarySupervisor",
        formik,
        searchTermSetter: setPrimaryManagerSearchTerm,
        setSupervisor: setEmployeeEmploymentDetails
      });
      formik?.values?.secondarySupervisor &&
        (await onManagerRemove({
          fieldName: "secondarySupervisor",
          formik,
          searchTermSetter: setSecondaryManagerSearchTerm,
          setSupervisor: setEmployeeEmploymentDetails
        }));
    };

    const handleSecondaryManagerSelect = async (
      user: EmployeeDataType
    ): Promise<void> => {
      await handleManagerSelect({
        user,
        fieldName: "secondarySupervisor",
        formik,
        searchTermSetter: setSecondaryManagerSearchTerm,
        setSupervisor: setEmployeeEmploymentDetails,
        setIsPopperOpen: setIsSecondaryManagerPopperOpen
      });
    };

    const handleSecondaryManagerRemove = async (): Promise<void> => {
      await onManagerRemove({
        fieldName: "secondarySupervisor",
        formik,
        searchTermSetter: setSecondaryManagerSearchTerm,
        setSupervisor: setEmployeeEmploymentDetails
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
        if (updatedData.isWorkEmailExists && !formik.touched.workEmail) {
          setIsUniqueEmail(false);
        } else {
          setIsUniqueEmail(true);
        }

        if (
          updatedData.isIdentificationNoExists &&
          !formik.touched.employeeNumber &&
          initialValues.employeeNumber !== values?.employeeNumber
        ) {
          setIsUniqueEmployeeNo(false);
        } else {
          setIsUniqueEmployeeNo(true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      checkEmailAndIdentificationNo,
      isSuccess,
      formik.touched.workEmail,
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
          ...(employeeEmploymentDetails?.teams ?? []),
          latestTeamId as number
        ]).catch(rejects);
        setLatestTeamId(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestTeamId]);

    useEffect(() => {
      if (!isManager && !isProfileView) {
        void refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.workEmail, values.employeeNumber]);

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

    return (
      <PeopleLayout
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
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            spacing={2}
            sx={{
              mb: "2rem"
            }}
          >
            {isAdmin && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputField
                  label={translateText(["employeeNo"])}
                  inputType="text"
                  value={values.employeeNumber}
                  placeHolder={translateText(["enterEmployeeNo"])}
                  onChange={handleInput}
                  inputName="employeeNumber"
                  error={
                    errors.employeeNumber && !isManager
                      ? errors.employeeNumber
                      : ""
                  }
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isManager || isProfileView || isInputsDisabled}
                  maxLength={10}
                  isDisabled={isInputsDisabled}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["workEmail"])}
                inputType="text"
                value={values.workEmail}
                placeHolder={translateText(["enterWorkEmail"])}
                onChange={handleInput}
                inputName="workEmail"
                error={errors.workEmail && !isManager ? errors.workEmail : ""}
                componentStyle={{
                  mt: "0rem"
                }}
                required={!isManager && !isProfileView}
                readOnly={
                  (isManager ||
                    isUpdate ||
                    isProfileView ||
                    isInputsDisabled) &&
                  !isPendingInvitationListOpen
                }
                isDisabled={isInputsDisabled}
                maxLength={100}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="employmentAllocation"
                label={translateText(["employmentAllocation"])}
                value={values.employmentAllocation}
                placeholder={translateText(["selectEmploymentAllocation"])}
                onChange={handleChange}
                error={errors.employmentAllocation ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={EmployementAllocationList}
                readOnly={isManager || isProfileView}
                isDisabled={isInputsDisabled}
                checkSelected
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{
                display:
                  isManager && values.teams.length === 0 ? "none" : "block"
              }}
            >
              {projectTeamList?.length === 0 && !isManager && !isProfileView ? (
                <InteractiveInputTrigger
                  id="add-new-team-button"
                  label={translateText(["teams"])}
                  placeholder={translateText(["addNewTeam"])}
                  componentStyle={{ mt: "0rem" }}
                  fieldButtonAction={() => {
                    setIsTeamModalOpen(true);
                    setTeamModalType(TeamModelTypes.ADD_TEAM);
                  }}
                  error={errors?.teams ?? ""}
                  isDisable={isInputsDisabled}
                />
              ) : isManager || isProfileView ? (
                <MultiSelectChipInput
                  chipList={
                    projectTeamList
                      .filter((project) =>
                        values.teams.includes(project.value as number)
                      )
                      .map((project) => project.label) as string[]
                  }
                  chipWrapperStyles={{
                    borderWidth: 0
                  }}
                  chipStyles={{
                    backgroundColor: "common.white",
                    color: theme.palette.grey[700],
                    borderWidth: 0,
                    borderColor: "common.white",
                    fontWeight: 400,
                    fontSize: "1rem",
                    height: "max-content"
                  }}
                  hiddenChipStyles={{
                    borderWidth: 0,
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: 400,
                    fontSize: "1rem",
                    height: "max-content"
                  }}
                  label={translateText(["teams"])}
                />
              ) : (
                <MultivalueDropdownList
                  inputName="teams"
                  label={translateText(["teams"])}
                  isMultiValue
                  value={values?.teams}
                  placeholder={translateText(["selectTeams"])}
                  onChange={(value) => handleTeamSelect(value as number[])}
                  error={errors.employmentStatus ?? ""}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  onAddNewClickBtn={() => {
                    setIsTeamModalOpen(true);
                    setTeamModalType(TeamModelTypes.ADD_TEAM);
                  }}
                  isCheckSelected
                  isErrorFocusOutlineNeeded={false}
                  itemList={projectTeamList}
                  isDisabled={isManager || isProfileView || isInputsDisabled}
                  addNewClickBtnText={translateText(["addNewTeam"])}
                />
              )}
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isEmployee ? "none" : "block" }}
            >
              <AvatarSearch
                id="primary-manager-search"
                title={translateText(["primarySupervisor"])}
                newResourceManager={employeeEmploymentDetails.primarySupervisor}
                isManagerPopperOpen={isPrimaryManagerPopperOpen}
                managerSuggestions={primaryManagerSuggestions}
                managerSearchTerm={primaryManagerSearchTerm}
                handleManagerRemove={handlePrimaryManagerRemove}
                handleManagerSelect={handlePrimaryManagerSelect}
                setIsManagerPopperOpen={setIsPrimaryManagerPopperOpen}
                onManagerSearchChange={onPrimaryManagerSearchChange}
                errors={errors?.primarySupervisor?.employeeId ?? ""}
                inputName={"primarySupervisor"}
                isDisabled={isManager || isProfileView || isInputsDisabled}
                placeholder={
                  !isManager && !isProfileView
                    ? translateText(["selectPrimarySupervisor"])
                    : ""
                }
                needSearchIcon={!isManager && !isProfileView}
                noSearchResultTexts={translateText(["noSearchResults"])}
                isDisabledLabel={isInputsDisabled}
                componentStyle={{
                  width: "100%"
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isEmployee ? "none" : "block" }}
            >
              <AvatarSearch
                id="secondary-manager-search"
                title={translateText(["secondarySupervisor"])}
                newResourceManager={
                  employeeEmploymentDetails.secondarySupervisor
                }
                isManagerPopperOpen={isSecondaryManagerPopperOpen}
                managerSuggestions={secondaryManagerSuggestions}
                managerSearchTerm={secondaryManagerSearchTerm}
                handleManagerRemove={handleSecondaryManagerRemove}
                handleManagerSelect={handleSecondaryManagerSelect}
                setIsManagerPopperOpen={setIsSecondaryManagerPopperOpen}
                onManagerSearchChange={onSecondaryManagerSearchChange}
                errors={errors?.secondarySupervisor?.employeeId ?? ""}
                inputName={"secondarySupervisor"}
                isDisabled={
                  isManager ||
                  isProfileView ||
                  Number(
                    employeeEmploymentDetails?.primarySupervisor?.employeeId ??
                      0
                  ) <= 0 ||
                  isInputsDisabled
                }
                isDisabledLabel={
                  Number(
                    employeeEmploymentDetails?.primarySupervisor?.employeeId ??
                      0
                  ) <= 0 || isInputsDisabled
                }
                placeholder={
                  !isManager && !isProfileView
                    ? translateText(["selectSecondarySupervisor"])
                    : ""
                }
                needSearchIcon={!isManager && !isProfileView}
                noSearchResultTexts={translateText(["noSearchResults"])}
              />
            </Grid>
            {isAdmin && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["joinedDate"])}
                  placeholder={translateText(["selectJoinedDate"])}
                  value={DateTime.fromISO(values.joinedDate ?? "")}
                  onchange={async (newValue: string) =>
                    await dateOnChange(
                      "joinedDate",
                      convertDateToFormat(
                        new Date(newValue),
                        LONG_DATE_TIME_FORMAT
                      )
                    )
                  }
                  error={errors.joinedDate}
                  minDate={DateTime.fromISO(
                    employeeEmploymentDetails?.probationStartDate ?? ""
                  )}
                  maxDate={DateTime.fromISO(new Date().toISOString())}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  inputFormat="dd/MM/yyyy"
                  readOnly={isManager || isProfileView}
                  disabled={isInputsDisabled}
                  selectedDate={selectedJoinedDate}
                  setSelectedDate={setSelectedJoinedDate}
                />
              </Grid>
            )}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["probationStartDate"])}
                  placeholder={
                    !isManager && !isProfileView
                      ? translateText(["selectProbationStartDate"])
                      : ""
                  }
                  value={DateTime.fromISO(values.probationStartDate ?? "")}
                  onchange={async (newValue: string) =>
                    await dateOnChange(
                      "probationStartDate",
                      convertDateToFormat(
                        new Date(newValue),
                        LONG_DATE_TIME_FORMAT
                      )
                    )
                  }
                  minDate={DateTime.fromISO(
                    employeeEmploymentDetails?.joinedDate ?? ""
                  )}
                  error={errors.probationStartDate}
                  inputFormat="dd/MM/yyyy"
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isManager || isProfileView}
                  disableMaskedInput
                  disabled={isInputsDisabled}
                  selectedDate={selectedProbationStartDate}
                  setSelectedDate={setSelectedProbationStartDate}
                />
              </Grid>
            )}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["probationEndDate"])}
                  placeholder={
                    !isManager && !isProfileView
                      ? translateText(["selectProbationEndDate"])
                      : ""
                  }
                  value={DateTime.fromISO(values.probationEndDate ?? "")}
                  onchange={async (newValue: string) =>
                    await dateOnChange(
                      "probationEndDate",
                      convertDateToFormat(
                        new Date(newValue),
                        LONG_DATE_TIME_FORMAT
                      )
                    )
                  }
                  minDate={DateTime.fromISO(
                    employeeEmploymentDetails?.probationStartDate
                      ? employeeEmploymentDetails?.probationStartDate
                      : employeeEmploymentDetails?.joinedDate
                        ? employeeEmploymentDetails?.joinedDate
                        : ""
                  )}
                  error={errors.probationEndDate}
                  inputFormat="dd/MM/yyyy"
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isManager || isProfileView}
                  disabled={isInputsDisabled}
                  selectedDate={selectedProbationEndDate}
                  setSelectedDate={setSelectedProbationEndDate}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownAutocomplete
                itemList={timeZonesList}
                inputName="workTimeZone"
                label={translateText(["workTimeZone"])}
                value={
                  values?.workTimeZone
                    ? {
                        label: workTimeZoneDictionary[values.workTimeZone],
                        value: values.workTimeZone
                      }
                    : undefined
                }
                placeholder={translateText(["selectWorkTimeZone"])}
                onChange={handleWorkTimeZoneChange}
                error={errors.workTimeZone ?? ""}
                isDisableOptionFilter={true}
                componentStyle={{
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                readOnly={isManager}
              />
            </Grid>
          </Grid>

          {!isManager && !isProfileView && (
            <TeamModalController setLatestTeamId={setLatestTeamId} />
          )}
        </form>
      </PeopleLayout>
    );
  }
);

EmploymentDetailsSection.displayName = "EmploymentDetailsSection";

export default EmploymentDetailsSection;
