import { Grid2 as Grid } from "@mui/material";
import { Theme, useTheme } from "@mui/system";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import {
  forwardRef,
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
import {
  LONG_DATE_TIME_FORMAT,
  REVERSE_DATE_FORMAT
} from "~community/common/constants/timeConstants";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { timeZonesList } from "~community/common/utils/data/timeZones";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import SupervisorSelector from "~community/people/components/molecules/SupervisorSelector/SupervisorSelector";
import { AccountStatusTypes } from "~community/people/enums/PeopleEnums";
import useEmployeeDetailsFormHandler from "~community/people/hooks/useEmployeeDetailsFormHandler";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeEmploymentContextType } from "~community/people/types/EmployeeTypes";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import {
  L3EmploymentDetailsType,
  L4ManagerType
} from "~community/people/types/PeopleTypes";
import { TeamModelTypes } from "~community/people/types/TeamTypes";
import { EmployementAllocationList } from "~community/people/utils/data/employeeSetupStaticData";
import { employeeEmploymentDetailsValidation } from "~community/people/utils/peopleValidations";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";
import TeamModalController from "../../TeamModalController/TeamModalController";

interface Props {
  isReadOnly?: boolean;
  isUpdate?: boolean;
  isProfileView?: boolean;
  isInputsDisabled?: boolean;
  isEmployee?: boolean;
}

const EmploymentDetailsSection = forwardRef<FormMethods, Props>(
  (
    {
      isReadOnly = false,
      isUpdate = false,
      isProfileView = false,
      isInputsDisabled = false,
      isEmployee = false
    }: Props,
    ref
  ) => {
    const theme: Theme = useTheme();

    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "employmentDetails"
    );
    const translateAria = useTranslator(
      "peopleAria",
      "addResource",
      "employmentDetails"
    );

    const [secondarySupervisorFilterEl, setSecondarySupervisorFilterEl] =
      useState<null | HTMLElement>(null);

    const [selectedOtherSupervisors, setSelectedOtherSupervisors] = useState<
      L4ManagerType[]
    >([]);
    const router = useRouter();
    const { id } = router.query;

    const { isPeopleManager, isProTier } = useSessionData();

    const { employee, setTeamModalType, setIsTeamModalOpen } = usePeopleStore(
      (state) => state
    );

    const [isUniqueEmail, setIsUniqueEmail] = useState<boolean>(false);
    const [isUniqueEmployeeNo, setIsUniqueEmployeeNo] =
      useState<boolean>(false);

    const onSubmit = async (): Promise<void> => {
      setIsPrimaryManagerPopperOpen(false);
      setIsSecondaryManagerPopperOpen(false);
      await refetch();
    };

    const { apiPayload } = useFormChangeDetector();

    const initialValues = useMemo<L3EmploymentDetailsType>(
      () =>
        employee?.employment?.employmentDetails ||
        ({} as L3EmploymentDetailsType),
      [employee]
    );

    const context: EmployeeEmploymentContextType = {
      isUniqueEmail,
      isUniqueEmployeeNo,
      isUpdate: apiPayload?.employment?.employmentDetails?.email
        ? false
        : isUpdate
    };

    const formik = useFormik<L3EmploymentDetailsType>({
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

    const {
      isPrimaryManagerPopperOpen,
      isSecondaryManagerPopperOpen,
      selectedJoinedDate,
      selectedProbationStartDate,
      selectedProbationEndDate,
      workTimeZoneDictionary,
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
    } = useEmployeeDetailsFormHandler({
      formik,
      id,
      isManager: isReadOnly,
      isProfileView,
      setIsUniqueEmail,
      setIsUniqueEmployeeNo
    });

    const { values, errors } = formik;

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const validationErrors = await formik.validateForm();
        return validationErrors;
      },
      submitForm: async () => {
        await formik.submitForm();
      },
      resetForm: () => {
        formik.resetForm();
      },
      setFieldError: (field: string, message: string) => {
        formik.setFieldError(field, message);
      }
    }));

    const otherSupervisorsCount =
      employee?.employment?.employmentDetails?.otherSupervisors?.length ?? 0;

    useEffect(() => {
      if (employee?.employment?.employmentDetails?.otherSupervisors) {
        setSelectedOtherSupervisors(
          employee?.employment?.employmentDetails?.otherSupervisors
        );
      }
    }, [
      employee?.employment?.employmentDetails?.otherSupervisors,
      setSelectedOtherSupervisors
    ]);

    return (
      <PeopleFormSectionWrapper
        title={translateText(["title"])}
        containerStyles={{
          padding: "0",
          margin: "0 auto",
          height: "auto",
          fontFamily: "Poppins, sans-serif"
        }}
        dividerStyles={{
          mt: "0.5rem"
        }}
        pageHead={translateText(["head"])}
      >
        <form onSubmit={() => {}}>
          <Grid
            container
            spacing={2}
            sx={{
              mb: "2rem"
            }}
          >
            {(isPeopleManager || isProfileView) && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputField
                  label={translateText(["employeeNo"])}
                  inputType="text"
                  value={values.employeeNumber}
                  placeHolder={translateText(["enterEmployeeNo"])}
                  onChange={handleInput}
                  inputName="employeeNumber"
                  error={
                    errors.employeeNumber && !isReadOnly
                      ? errors.employeeNumber
                      : ""
                  }
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isReadOnly || isProfileView || isInputsDisabled}
                  maxLength={10}
                  isDisabled={isInputsDisabled}
                  ariaLabel={translateAria(["enterEmployeeNo"])}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["workEmail"])}
                inputType="text"
                value={values.email}
                placeHolder={translateText(["enterWorkEmail"])}
                onChange={handleInput}
                inputName="email"
                error={errors.email && !isReadOnly ? errors.email : ""}
                componentStyle={{
                  mt: "0rem"
                }}
                required={!isReadOnly && !isProfileView}
                readOnly={
                  (isReadOnly ||
                    isUpdate ||
                    isProfileView ||
                    isInputsDisabled) &&
                  employee?.common?.accountStatus !== AccountStatusTypes.PENDING
                }
                isDisabled={isInputsDisabled}
                maxLength={100}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="employmentAllocation"
                label={translateText(["employmentAllocation"])}
                value={values.employmentAllocation ?? ""}
                placeholder={
                  isReadOnly
                    ? ""
                    : translateText(["selectEmploymentAllocation"])
                }
                onChange={handleChange}
                error={errors.employmentAllocation ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={EmployementAllocationList}
                readOnly={isReadOnly || isProfileView}
                isDisabled={isInputsDisabled}
                checkSelected
                ariaLabel={translateAria(["selectEmploymentAllocation"])}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{
                display:
                  isReadOnly && values?.teamIds?.length === 0 ? "none" : "block"
              }}
            >
              {projectTeamList?.length === 0 &&
              !isReadOnly &&
              !isProfileView ? (
                <InteractiveInputTrigger
                  id="add-new-team-button"
                  label={translateText(["teams"])}
                  placeholder={translateText(["addNewTeam"])}
                  componentStyle={{ mt: "0rem" }}
                  fieldButtonAction={() => {
                    setIsTeamModalOpen(true);
                    setTeamModalType(TeamModelTypes.ADD_TEAM);
                  }}
                  error={errors?.teamIds ?? ""}
                  isDisable={isInputsDisabled}
                />
              ) : isReadOnly || isProfileView ? (
                <MultiSelectChipInput
                  chipList={
                    projectTeamList
                      .filter((project) =>
                        values?.teamIds?.includes(project.value as number)
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
                  inputName="teamIds"
                  label={translateText(["teams"])}
                  isMultiValue
                  value={values?.teamIds ?? []}
                  placeholder={translateText(["selectTeams"])}
                  onChange={(value) => handleTeamSelect(value as number[])}
                  error={errors?.teamIds ?? ""}
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
                  isDisabled={isReadOnly || isProfileView || isInputsDisabled}
                  addNewClickBtnText={translateText(["addNewTeam"])}
                  ariaLabel={translateAria(["selectMultipleTeams"])}
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
                newResourceManager={
                  employee?.employment?.employmentDetails?.primarySupervisor
                }
                isManagerPopperOpen={isPrimaryManagerPopperOpen}
                managerSuggestions={primaryManagerSuggestions}
                managerSearchTerm={primaryManagerSearchTerm}
                handleManagerRemove={handlePrimaryManagerRemove}
                handleManagerSelect={handlePrimaryManagerSelect}
                setIsManagerPopperOpen={setIsPrimaryManagerPopperOpen}
                onManagerSearchChange={onPrimaryManagerSearchChange}
                errors={errors?.primarySupervisor ?? ""}
                inputName={"primarySupervisor"}
                isDisabled={isReadOnly || isProfileView || isInputsDisabled}
                placeholder={
                  !isReadOnly && !isProfileView
                    ? translateText(["selectPrimarySupervisor"])
                    : ""
                }
                needSearchIcon={!isReadOnly && !isProfileView}
                noSearchResultTexts={translateText(["noSearchResults"])}
                isDisabledLabel={isInputsDisabled}
                componentStyle={{
                  width: "100%"
                }}
                onKeyDown={handleBackspacePressPrimary}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isEmployee ? "none" : "block" }}
            >
              {!isProTier ? (
                <AvatarSearch
                  id="secondary-manager-search"
                  title={translateText(["secondarySupervisor"])}
                  newResourceManager={
                    employee?.employment?.employmentDetails
                      ?.otherSupervisors?.[0]
                  }
                  isManagerPopperOpen={isSecondaryManagerPopperOpen}
                  managerSuggestions={secondaryManagerSuggestions}
                  managerSearchTerm={secondaryManagerSearchTerm}
                  handleManagerRemove={handleSecondaryManagerRemove}
                  handleManagerSelect={handleSecondaryManagerSelect}
                  setIsManagerPopperOpen={setIsSecondaryManagerPopperOpen}
                  onManagerSearchChange={onSecondaryManagerSearchChange}
                  errors={errors?.otherSupervisors ?? ""}
                  inputName={"secondarySupervisor"}
                  isDisabled={
                    isReadOnly ||
                    isProfileView ||
                    Number(
                      employee?.employment?.employmentDetails?.primarySupervisor
                        ?.employeeId ?? 0
                    ) <= 0 ||
                    isInputsDisabled
                  }
                  isDisabledLabel={
                    Number(
                      employee?.employment?.employmentDetails?.primarySupervisor
                        ?.employeeId ?? 0
                    ) <= 0 || isInputsDisabled
                  }
                  placeholder={
                    !isReadOnly && !isProfileView
                      ? translateText(["selectSecondarySupervisor"])
                      : ""
                  }
                  needSearchIcon={!isReadOnly && !isProfileView}
                  noSearchResultTexts={translateText(["noSearchResults"])}
                  onKeyDown={handleBackspacePressSecondary}
                />
              ) : (
                <SupervisorSelector
                  employee={employee}
                  otherSupervisorsCount={otherSupervisorsCount}
                  managerSuggestions={secondaryManagerSuggestions}
                  managerSearchTerm={secondaryManagerSearchTerm}
                  setManagerSearchTerm={setSecondaryManagerSearchTerm}
                  onmanagerSearchChange={onSecondaryManagerSearchChange}
                  selectedManagers={selectedOtherSupervisors}
                  setSelectedManagers={setSelectedOtherSupervisors}
                  isInputsDisabled={
                    isInputsDisabled ||
                    !employee?.employment?.employmentDetails?.primarySupervisor
                      ?.employeeId ||
                    isReadOnly ||
                    isProfileView
                  }
                  label={translateText(["otherSupervisors"])}
                  filterEl={secondarySupervisorFilterEl}
                  setFilterEl={setSecondarySupervisorFilterEl}
                  isSearchResultsLoading={isSecondaryManagersLoading}
                />
              )}
            </Grid>
            {isPeopleManager && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["joinedDate"])}
                  placeholder={translateText(["selectJoinedDate"])}
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
                    employee?.employment?.employmentDetails
                      ?.probationStartDate ?? ""
                  )}
                  maxDate={DateTime.fromISO(new Date().toISOString())}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  inputFormat={REVERSE_DATE_FORMAT}
                  readOnly={isReadOnly || isProfileView}
                  disabled={isInputsDisabled}
                  selectedDate={selectedJoinedDate}
                  setSelectedDate={setSelectedJoinedDate}
                />
              </Grid>
            )}
            {isPeopleManager && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["probationStartDate"])}
                  placeholder={
                    !isReadOnly && !isProfileView
                      ? translateText(["selectProbationStartDate"])
                      : ""
                  }
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
                    employee?.employment?.employmentDetails?.joinedDate ?? ""
                  )}
                  error={errors.probationStartDate}
                  inputFormat={REVERSE_DATE_FORMAT}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isReadOnly || isProfileView}
                  disableMaskedInput
                  disabled={isInputsDisabled}
                  selectedDate={selectedProbationStartDate}
                  setSelectedDate={setSelectedProbationStartDate}
                />
              </Grid>
            )}
            {isPeopleManager && (
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <InputDate
                  label={translateText(["probationEndDate"])}
                  placeholder={
                    !isReadOnly && !isProfileView
                      ? translateText(["selectProbationEndDate"])
                      : ""
                  }
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
                    employee?.employment?.employmentDetails?.probationStartDate
                      ? employee?.employment?.employmentDetails
                          ?.probationStartDate
                      : employee?.employment?.employmentDetails?.joinedDate
                        ? employee?.employment?.employmentDetails?.joinedDate
                        : ""
                  )}
                  error={errors.probationEndDate}
                  inputFormat={REVERSE_DATE_FORMAT}
                  componentStyle={{
                    mt: "0rem"
                  }}
                  readOnly={isReadOnly || isProfileView}
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
                placeholder={
                  isReadOnly ? "" : translateText(["selectWorkTimeZone"])
                }
                onChange={handleWorkTimeZoneChange}
                error={errors.workTimeZone ?? ""}
                isDisableOptionFilter={true}
                componentStyle={{
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>
          </Grid>
          {!isReadOnly && !isProfileView && (
            <TeamModalController setLatestTeamId={setLatestTeamId} />
          )}
        </form>
      </PeopleFormSectionWrapper>
    );
  }
);

EmploymentDetailsSection.displayName = "EmploymentDetailsSection";

export default EmploymentDetailsSection;
