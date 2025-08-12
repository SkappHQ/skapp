import { Box, Grid2 as Grid, Stack, type Theme, useTheme } from "@mui/material";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import { useDropzone } from "react-dropzone";

import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import RequestCancelCrossIcon from "~community/common/assets/Icons/RequestCancelCrossIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { appModes } from "~community/common/constants/configs";
import { generalDetailsSectionTestId } from "~community/common/constants/testIds";
import { REVERSE_DATE_FORMAT } from "~community/common/constants/timeConstants";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { NINETY_PERCENT } from "~community/common/utils/getConstants";
import {
  NAME_MAX_CHARACTER_LENGTH,
  PASSPORT_AND_NIN_MAX_CHARACTER_LENGTH
} from "~community/people/constants/configs";
import useGeneralDetailsFormHandlers from "~community/people/hooks/useGeneralDetailsFormHandlers";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import { usePeopleStore } from "~community/people/store/store";
import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { L3GeneralDetailsType } from "~community/people/types/PeopleTypes";
import {
  GenderList,
  MaritalStatusList,
  NationalityList
} from "~community/people/utils/data/employeeSetupStaticData";
import generateThumbnail from "~community/people/utils/image/thumbnailGenerator";
import { employeeGeneralDetailsValidation } from "~community/people/utils/peopleValidations";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  isReadOnly?: boolean;
  isAdmin?: boolean;
  isInputsDisabled?: boolean;
  isAddFlow?: boolean;
}

const GeneralDetailsSection = forwardRef<FormMethods, Props>(
  (
    {
      isReadOnly = false,
      isAdmin = false,
      isInputsDisabled = false,
      isAddFlow
    }: Props,
    ref
  ) => {
    const theme: Theme = useTheme();
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "generalDetails"
    );
    const translateAria = useTranslator(
      "peopleAria",
      "addResource",
      "generalDetails"
    );

    const translateStorageText = useTranslator("StorageToastMessage");

    const { setToastMessage } = useToast();

    const { employee, setCommonDetails, setThumbnail, setProfilePic } =
      usePeopleStore((state) => state);

    const initialValues = useMemo<L3GeneralDetailsType & { country?: string }>(
      () => ({
        ...employee?.personal?.general,
        country: employee?.personal?.contact?.country
      }),
      [employee]
    );

    const formik = useFormik({
      initialValues,
      validationSchema: employeeGeneralDetailsValidation(translateText),
      onSubmit: () => {},
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const {
      handleChange,
      handleNationalitySelect,
      handleDateChange,
      age,
      selectedDob,
      setSelectedDob
    } = useGeneralDetailsFormHandlers({ formik });

    const { values, errors } = formik;

    const { data: storageAvailabilityData } = useStorageAvailability();

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
      }
    }));

    const usedStoragePercentage = useMemo(() => {
      return 100 - storageAvailabilityData?.availableSpace;
    }, [storageAvailabilityData]);

    const getAvatarThumbnailUrl = useCallback((): string => {
      if (employee?.common?.authPic !== undefined) {
        if (Array.isArray(employee?.common?.authPic)) {
          return employee?.common?.authPic[0]?.preview;
        }
        return employee?.common?.authPic ?? "";
      }

      return "";
    }, [employee?.common?.authPic]);

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        const profilePic = acceptedFiles.map((file: File) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        );

        setCommonDetails({
          authPic: profilePic[0]?.preview ?? ""
        });

        setProfilePic(profilePic as ModifiedFileType[]);
        generateThumbnail(profilePic[0] as ModifiedFileType).then((thumbnail) =>
          setThumbnail(thumbnail)
        );
      },
      [employee?.common?.employeeId]
    );

    const { open, getInputProps } = useDropzone({
      onDrop,
      noClick: true,
      noKeyboard: true,
      accept: {
        "image/svg+xml": [],
        "image/png": [],
        "image/jpg": [],
        "image/jpeg": []
      }
    });

    const handleUnSelectPhoto = (): void => {
      setProfilePic([]);
      setThumbnail([]);
      setCommonDetails({
        authPic: ""
      });
    };

    const handleImageClick = () => {
      if (employee?.common?.authPic?.length) {
        handleUnSelectPhoto();
      } else if (
        process.env.NEXT_PUBLIC_MODE === appModes.COMMUNITY &&
        usedStoragePercentage >= NINETY_PERCENT
      ) {
        setToastMessage({
          open: true,
          toastType: "error",
          title: translateStorageText(["storageTitle"]),
          description: translateStorageText(["contactAdminText"]),
          isIcon: true
        });
      } else {
        open();
      }
    };

    const countryList = useGetCountryList();

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
        <form onSubmit={formik.handleSubmit}>
          {isAddFlow && (
            <Stack
              direction="column"
              sx={{ display: isReadOnly || isAdmin ? "none" : "block" }}
            >
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  mb: "1.5rem",
                  position: "relative"
                }}
              >
                <Avatar
                  id="avatar"
                  alt={`${values.firstName} ${values.lastName}`}
                  src={getAvatarThumbnailUrl()}
                  avatarStyles={{
                    width: "6.125rem",
                    height: "6.125rem",
                    backgroundColor: theme.palette.grey[200]
                  }}
                  firstName={values.firstName || ""}
                  lastName={values.lastName || ""}
                >
                  <Icon name={IconName.USER_UPLOAD_ICON} />
                </Avatar>
                <Box>
                  <input id="imageInput" {...getInputProps()} />
                  <Box
                    sx={{
                      position: "absolute",
                      left: "4.375rem",
                      top: "5rem",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      backgroundColor: theme.palette.secondary.main,
                      cursor: "pointer",
                      zIndex: ZIndexEnums.DEFAULT
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={translateAria(["addProfileAvatar"])}
                    onClick={handleImageClick}
                  >
                    {employee?.common?.authPic?.length ? (
                      <RequestCancelCrossIcon
                        fill={theme.palette.primary.dark}
                      />
                    ) : (
                      <PlusIcon fill={theme.palette.primary.dark} />
                    )}
                  </Box>
                </Box>
              </Stack>
            </Stack>
          )}

          <Grid
            container
            spacing={2}
            sx={{
              mb: "2rem"
            }}
          >
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["firstName"])}
                inputType="text"
                value={values.firstName}
                placeHolder={translateText(["enterFirstName"])}
                onChange={handleChange}
                inputName="firstName"
                error={errors.firstName ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                required={!isReadOnly}
                readOnly={isReadOnly}
                isDisabled={isInputsDisabled}
                maxLength={NAME_MAX_CHARACTER_LENGTH}
                data-testid={generalDetailsSectionTestId.InputFields.firstName}
                validation-testid={
                  generalDetailsSectionTestId.InputFields.firstNameValidation
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["middleName"])}
                inputType="text"
                value={values.middleName}
                placeHolder={
                  !isReadOnly ? translateText(["enterMiddleName"]) : ""
                }
                onChange={handleChange}
                inputName="middleName"
                error={errors.middleName ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                readOnly={isReadOnly}
                isDisabled={isInputsDisabled}
                maxLength={NAME_MAX_CHARACTER_LENGTH}
                data-testid={generalDetailsSectionTestId.InputFields.middleName}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["lastName"])}
                inputType="text"
                value={values.lastName}
                placeHolder={translateText(["enterLastName"])}
                onChange={handleChange}
                inputName="lastName"
                error={errors.lastName ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                required={!isReadOnly}
                readOnly={isReadOnly}
                isDisabled={isInputsDisabled}
                maxLength={NAME_MAX_CHARACTER_LENGTH}
                data-testid={generalDetailsSectionTestId.InputFields.lastName}
                validation-testid={
                  generalDetailsSectionTestId.InputFields.lastNameValidation
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="gender"
                label={translateText(["gender"])}
                value={values.gender ?? ""}
                placeholder={isReadOnly ? "" : translateText(["selectGender"])}
                onChange={handleChange}
                error={errors.gender ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={GenderList}
                checkSelected
                readOnly={isReadOnly}
                isDisabled={isInputsDisabled}
                ariaLabel={translateAria(["selectGender"])}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem"
                }}
              >
                <InputDate
                  label={translateText(["birthDate"])}
                  onchange={handleDateChange}
                  placeholder={
                    isReadOnly ? "" : translateText(["selectBirthDate"])
                  }
                  error={errors?.dateOfBirth ?? ""}
                  maxDate={DateTime.fromISO(
                    new Date()?.toISOString()?.split("T")[0]
                  )}
                  componentStyle={{
                    flex: 1,
                    mt: "0rem"
                  }}
                  inputFormat={REVERSE_DATE_FORMAT}
                  disabled={isInputsDisabled}
                  readOnly={isReadOnly}
                  selectedDate={selectedDob}
                  setSelectedDate={setSelectedDob}
                />
                <InputField
                  label={translateText(["age"])}
                  inputType="text"
                  value={age}
                  isDisabled={true}
                  inputName="age"
                  componentStyle={{
                    flex: 0.25,
                    mt: "0rem"
                  }}
                  labelStyles={{
                    color: theme.palette.grey.A100
                  }}
                />
              </div>
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownAutocomplete
                itemList={NationalityList}
                inputName="nationality"
                label={translateText(["nationality"])}
                value={{
                  label: values.nationality ?? "",
                  value: values.nationality ?? ""
                }}
                placeholder={
                  isReadOnly ? "" : translateText(["selectNationality"])
                }
                onChange={handleNationalitySelect}
                error={errors.nationality ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isReadOnly ? "none" : "block" }}
            >
              <InputField
                label={translateText(["nin"])}
                inputType="text"
                value={values.nin}
                placeHolder={translateText(["enterNIN"])}
                onChange={handleChange}
                inputName="nin"
                error={errors.nin ?? ""}
                componentStyle={{
                  flex: 1
                }}
                isDisabled={isInputsDisabled}
                maxLength={PASSPORT_AND_NIN_MAX_CHARACTER_LENGTH}
                ariaLabel={translateAria(["enterNIN"])}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isReadOnly ? "none" : "block" }}
            >
              <InputField
                label={translateText(["passportNo"])}
                inputType="text"
                value={values.passportNumber}
                placeHolder={translateText(["enterPassportNo"])}
                onChange={handleChange}
                inputName="passportNumber"
                error={errors.passportNumber ?? ""}
                componentStyle={{
                  flex: 1
                }}
                isDisabled={isInputsDisabled}
                maxLength={PASSPORT_AND_NIN_MAX_CHARACTER_LENGTH}
                ariaLabel={translateAria(["passportNumber"])}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isReadOnly ? "none" : "block" }}
            >
              <DropdownList
                inputName="maritalStatus"
                label={translateText(["maritalStatus"])}
                value={values.maritalStatus ?? ""}
                placeholder={translateText(["selectMaritalStatus"])}
                onChange={handleChange}
                error={errors.maritalStatus ?? ""}
                componentStyle={{
                  mt: "0rem"
                }}
                errorFocusOutlineNeeded={false}
                itemList={MaritalStatusList}
                checkSelected
                isDisabled={isInputsDisabled}
                ariaLabel={translateAria(["selectMaritalStatus"])}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 6, xl: 4 }}
              sx={{ display: isReadOnly ? "block" : "none" }}
            >
              <DropdownAutocomplete
                itemList={countryList}
                inputName="country"
                label={translateText(["country"])}
                value={
                  values.country
                    ? {
                        label: values.country,
                        value: values.country
                      }
                    : undefined
                }
                placeholder={isReadOnly ? "" : translateText(["selectCountry"])}
                componentStyle={{
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                readOnly={isReadOnly}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleFormSectionWrapper>
    );
  }
);

GeneralDetailsSection.displayName = "GeneralDetailsSection";

export default GeneralDetailsSection;
