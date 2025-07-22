import { Divider, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import InputField from "~community/common/components/molecules/InputField/InputField";
import SquareSelect from "~community/common/components/molecules/SquareSelect/SquareSelect";
import ROUTES from "~community/common/constants/routes";
import { characterLengths } from "~community/common/constants/stringConstants";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import {
  ButtonSizes,
  ButtonStyle,
  ToastType
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { allowsLettersAndSpecialCharactersForNames } from "~community/common/regex/regexPatterns";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { tenantID } from "~community/common/utils/axiosInterceptor";
import { useGetAllowedGrantablePermissions } from "~community/configurations/api/userRolesApi";
import {
  useCheckEmailAndIdentificationNoForQuickAdd,
  useQuickAddEmployeeMutation
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  QuickAddEmployeePayload,
  Role
} from "~community/people/types/EmployeeTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { quickAddEmployeeValidations } from "~community/people/utils/peopleValidations";
import { useGetEmployeeRoleLimit } from "~enterprise/common/api/peopleApi";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";
import { EmployeeRoleLimit } from "~enterprise/people/types/EmployeeTypes";

const AddNewResourceModal = () => {
  const { setToastMessage } = useToast();

  const router = useRouter();

  const { data: session } = useSession();

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "generalDetails"
  );

  const employmentDetailsTexts = useTranslator(
    "peopleModule",
    "addResource",
    "employmentDetails"
  );

  const generalTexts = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const permissionTexts = useTranslator(
    "peopleModule",
    "addResource",
    "systemPermissions"
  );

  const roleLimitationTexts = useTranslator("peopleModule", "roleLimitation");

  const translateAria = useTranslator(
    "peopleAria",
    "directory",
    "addPeopleModal"
  );

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const { setDirectoryModalType, setIsDirectoryModalOpen } = usePeopleStore(
    (state) => ({
      setDirectoryModalType: state.setDirectoryModalType,
      setIsDirectoryModalOpen: state.setIsDirectoryModalOpen
    })
  );

  const { resetPeopleSlice } = usePeopleStore((state) => state);

  const [roleLimits, setRoleLimits] = useState<EmployeeRoleLimit>({
    leaveAdminLimitExceeded: false,
    attendanceAdminLimitExceeded: false,
    peopleAdminLimitExceeded: false,
    leaveManagerLimitExceeded: false,
    attendanceManagerLimitExceeded: false,
    peopleManagerLimitExceeded: false,
    superAdminLimitExceeded: false,
    esignAdminLimitExceeded: false,
    esignSenderLimitExceeded: false
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    isSuperAdmin: false,
    peopleRole: Role.PEOPLE_EMPLOYEE,
    leaveRole: Role.LEAVE_EMPLOYEE,
    attendanceRole: Role.ATTENDANCE_EMPLOYEE,
    esignRole: Role.ESIGN_EMPLOYEE
  };

  const handleSuccess = () => {
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
  };

  const { mutate, isPending } = useQuickAddEmployeeMutation(handleSuccess);

  const onSubmit = async (values: any) => {
    const payload: QuickAddEmployeePayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      userRoles: {
        isSuperAdmin: values.isSuperAdmin,
        attendanceRole: values.attendanceRole,
        peopleRole: values.peopleRole,
        leaveRole: values.leaveRole,
        esignRole: values.esignRole
      }
    };

    mutate(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema: quickAddEmployeeValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true
  });

  const { values, errors, setFieldValue, setFieldError, handleSubmit } = formik;

  const {
    data: checkEmailAndIdentificationNo,
    refetch,
    isSuccess
  } = useCheckEmailAndIdentificationNoForQuickAdd(values.email, "");

  const closeModal = () => {
    setDirectoryModalType(DirectoryModalTypes.NONE);
    setIsDirectoryModalOpen(false);
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
  };

  const { data: grantablePermission } = useGetAllowedGrantablePermissions();

  const env = useGetEnvironment();

  const isEnterpriseMode = env === "enterprise";

  const { data: globalLogin } = useGetGlobalLoginMethod(
    isEnterpriseMode,
    tenantID as string
  );

  const validateWorkEmail = () => {
    const updatedData = checkEmailAndIdentificationNo;
    if (updatedData?.isWorkEmailExists) {
      setFieldError("email", translateText(["uniqueEmailError"]));
      return false;
    }

    if (isEnterpriseMode) {
      if (globalLogin == "GOOGLE" && !updatedData?.isGoogleDomain) {
        setFieldError("email", translateText(["workEmailGoogle"]));
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (
      checkEmailAndIdentificationNo &&
      checkEmailAndIdentificationNo.isWorkEmailExists !== null &&
      isSuccess
    ) {
      if (validateWorkEmail()) {
        handleSubmit();
      }
    }
  }, [isEnterpriseMode, checkEmailAndIdentificationNo, isSuccess]);

  const { mutate: checkRoleLimits } = useGetEmployeeRoleLimit(
    (response) => setRoleLimits(response),
    () => {
      router.push("/_error");
    }
  );

  useEffect(() => {
    if (env === "enterprise") {
      checkRoleLimits();
    }
  }, [env]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      if (
        value.length > characterLengths.NAME_LENGTH ||
        !allowsLettersAndSpecialCharactersForNames().test(value)
      ) {
        return;
      }
    }
    setFieldValue(name, value);
    setFieldError(name, "");
  };

  const handleSuperAdminChangeEnterprise = (isChecked: boolean) => {
    if (isChecked && roleLimits.superAdminLimitExceeded) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["superAdminLimitationTitle"]),
        description: roleLimitationTexts(["superAdminLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    handleIsSuperAdminPermission(isChecked);
  };

  const handleSuperAdminChangeDefault = (isChecked: boolean) =>
    handleIsSuperAdminPermission(isChecked);

  const handleIsSuperAdminPermission = (isChecked: boolean) => {
    setFieldValue("isSuperAdmin", isChecked);
    const updatedRole = isChecked ? Role.PEOPLE_ADMIN : Role.PEOPLE_EMPLOYEE;
    const updatedLeaveRole = isChecked ? Role.LEAVE_ADMIN : Role.LEAVE_EMPLOYEE;
    const updatedAttendanceRole = isChecked
      ? Role.ATTENDANCE_ADMIN
      : Role.ATTENDANCE_EMPLOYEE;
    const updateesignRole = isChecked ? Role.ESIGN_ADMIN : Role.ESIGN_EMPLOYEE;

    setFieldValue("peopleRole", updatedRole);
    setFieldValue("leaveRole", updatedLeaveRole);
    setFieldValue("attendanceRole", updatedAttendanceRole);
    setFieldValue("esignRole", updateesignRole);
  };

  const handleRoleChangeEnterprise = (name: string, value: any) => {
    if (
      name === "peopleRole" &&
      value === Role.PEOPLE_ADMIN &&
      roleLimits.peopleAdminLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["peopleAdminLimitationTitle"]),
        description: roleLimitationTexts(["peopleAdminLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    if (
      name === "leaveRole" &&
      value === Role.LEAVE_ADMIN &&
      roleLimits.leaveAdminLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["leaveAdminLimitationTitle"]),
        description: roleLimitationTexts(["leaveAdminLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    if (
      name === "attendanceRole" &&
      value === Role.ATTENDANCE_ADMIN &&
      roleLimits.attendanceAdminLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["attendanceAdminLimitationTitle"]),
        description: roleLimitationTexts([
          "attendanceAdminLimitationDescription"
        ]),
        isIcon: true
      });
      return;
    }

    if (
      name === "peopleRole" &&
      value === Role.PEOPLE_MANAGER &&
      roleLimits.peopleManagerLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["peopleManagerLimitationTitle"]),
        description: roleLimitationTexts([
          "peopleManagerLimitationDescription"
        ]),
        isIcon: true
      });
      return;
    }

    if (
      name === "leaveRole" &&
      value === Role.LEAVE_MANAGER &&
      roleLimits.leaveManagerLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["leaveManagerLimitationTitle"]),
        description: roleLimitationTexts(["leaveManagerLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    if (
      name === "attendanceRole" &&
      value === Role.ATTENDANCE_MANAGER &&
      roleLimits.attendanceManagerLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["attendanceManagerLimitationTitle"]),
        description: roleLimitationTexts([
          "attendanceManagerLimitationDescription"
        ]),
        isIcon: true
      });
      return;
    }

    if (
      name === "esignRole" &&
      value === Role.ESIGN_ADMIN &&
      roleLimits.esignAdminLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["eSignAdminLimitationTitle"]),
        description: roleLimitationTexts(["eSignAdminLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    if (
      name === "esignRole" &&
      value === Role.ESIGN_SENDER &&
      roleLimits.esignSenderLimitExceeded
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: roleLimitationTexts(["eSignSenderLimitationTitle"]),
        description: roleLimitationTexts(["eSignSenderLimitationDescription"]),
        isIcon: true
      });
      return;
    }

    setFieldValue(name, value);
  };

  const handleRoleChangeDefault = (name: string, value: any) => {
    setFieldValue(name, value);
  };

  const handleSuperAdminChange =
    env === "enterprise"
      ? handleSuperAdminChangeEnterprise
      : handleSuperAdminChangeDefault;

  const handleRoleChange =
    env === "enterprise" ? handleRoleChangeEnterprise : handleRoleChangeDefault;

  const handleRefetch = () => {
    if (!navigator.onLine) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["quickAddErrorTitle"]),
        description: translateText(["quickAddErrorDescription"])
      });
      return;
    }
    refetch();
  };

  return (
    <Stack aria-hidden={true}>
      <Stack
        sx={{
          flexDirection: "row",
          gap: 2,
          marginTop: 4
        }}
      >
        <InputField
          inputName="firstName"
          value={values.firstName}
          error={errors.firstName}
          label="First Name"
          required
          onChange={handleChange}
          maxLength={characterLengths.NAME_LENGTH}
          placeHolder={translateText(["enterFirstName"])}
        />
        <InputField
          inputName="lastName"
          value={values.lastName}
          error={errors.firstName}
          label="Last Name"
          required
          placeHolder={translateText(["enterLastName"])}
          onChange={handleChange}
          maxLength={characterLengths.NAME_LENGTH}
        />
      </Stack>
      <InputField
        inputName="email"
        value={values.email}
        error={errors.email}
        label="Work email"
        placeHolder={employmentDetailsTexts(["enterWorkEmail"])}
        required
        onChange={handleChange}
        componentStyle={{
          marginTop: 2
        }}
      />

      <Button
        isFullWidth={false}
        size={ButtonSizes.MEDIUM}
        buttonStyle={ButtonStyle.TERTIARY}
        label={"Add full profile"}
        styles={{
          marginTop: 2
        }}
        endIcon={
          <Icon
            name={IconName.FORWARD_ARROW}
            width="0.75rem"
            height="0.625rem"
          />
        }
        onClick={() => {
          setDirectoryModalType(DirectoryModalTypes.NONE);
          resetPeopleSlice();
          setIsDirectoryModalOpen(false);
          router.push(ROUTES.PEOPLE.ADD);
        }}
        data-testid={peopleDirectoryTestId.buttons.addFullProfileBtn}
      />

      <Stack
        style={{
          marginTop: 24
        }}
        role="region"
        aria-labelledby="system-permission-section"
      >
        <Typography
          id="system-permission-section"
          style={{
            fontWeight: "700"
          }}
        >
          {generalTexts(["systemPermissions"])}
        </Typography>
        <Divider
          sx={{
            marginY: 2
          }}
        />

        <Stack>
          <Stack
            direction={"row"}
            gap={6}
            marginTop={2}
            justifyContent={"space-between"}
          >
            <Stack direction={"row"} gap={3}>
              <Typography variant="label">
                {permissionTexts(["superAdmin"])}
              </Typography>
              <Icon name={IconName.SUPER_ADMIN_ICON} />
            </Stack>

            <Stack>
              <SwitchRow
                labelId="is-super-admin"
                checked={values.isSuperAdmin}
                onChange={(checked: boolean) => handleSuperAdminChange(checked)}
                arialabel={translateAria(["superAdminToggle"])}
              />
            </Stack>
          </Stack>

          <Stack direction={"column"} gap={1} marginTop={2}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="label">
                {permissionTexts(["people"])}
              </Typography>
              <SquareSelect
                id={"people-role-select"}
                name={"peopleRole"}
                options={grantablePermission?.people || []}
                value={values.peopleRole}
                customStyles={{
                  select: {
                    width: "12.5rem",
                    borderRadius: "6.25rem",
                    height: "3.125rem"
                  }
                }}
                onChange={(e) =>
                  handleRoleChange(e.target.name, e.target.value)
                }
                disabled={values.isSuperAdmin}
                accessibility={{
                  ariaLabel: translateAria(["peoplePermissions"])
                }}
              />
            </Stack>

            {session?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE) && (
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="label">
                  {permissionTexts(["leave"])}
                </Typography>
                <SquareSelect
                  id={"leave-role-select"}
                  name={"leaveRole"}
                  options={grantablePermission?.leave || []}
                  value={values.leaveRole}
                  customStyles={{
                    select: {
                      width: "12.5rem",
                      borderRadius: "6.25rem",
                      height: "3.125rem"
                    }
                  }}
                  onChange={(e) =>
                    handleRoleChange(e.target.name, e.target.value)
                  }
                  disabled={values.isSuperAdmin}
                  accessibility={{
                    ariaLabel: translateAria(["leavePermissions"])
                  }}
                />
              </Stack>
            )}

            {session?.user?.roles?.includes(
              EmployeeTypes.ATTENDANCE_EMPLOYEE
            ) && (
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="label">
                  {permissionTexts(["attendance"])}
                </Typography>
                <SquareSelect
                  id={"attendance-role-select"}
                  name={"attendanceRole"}
                  options={grantablePermission?.attendance || []}
                  value={values.attendanceRole}
                  customStyles={{
                    select: {
                      width: "12.5rem",
                      borderRadius: "6.25rem",
                      height: "3.125rem"
                    }
                  }}
                  onChange={(e) =>
                    handleRoleChange(e.target.name, e.target.value)
                  }
                  disabled={values.isSuperAdmin}
                  accessibility={{
                    ariaLabel: translateAria(["attendancePermissions"])
                  }}
                />
              </Stack>
            )}

            {session?.user?.roles?.includes(EmployeeTypes.ESIGN_EMPLOYEE) && (
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="label">
                  {permissionTexts(["eSignature"])}
                </Typography>
                <SquareSelect
                  id={"esign-role-select"}
                  name={"esignRole"}
                  options={grantablePermission?.esign || []}
                  value={values.esignRole}
                  customStyles={{
                    select: {
                      width: "12.5rem",
                      borderRadius: "6.25rem",
                      height: "3.125rem"
                    }
                  }}
                  onChange={(e) =>
                    handleRoleChange(e.target.name, e.target.value)
                  }
                  disabled={values.isSuperAdmin}
                  accessibility={{
                    ariaLabel: translateAria(["eSignPermissions"])
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Button
        buttonStyle={ButtonStyle.PRIMARY}
        label={"Save"}
        endIcon={IconName.FORWARD_ARROW}
        styles={{
          marginTop: 2
        }}
        onClick={handleRefetch}
        disabled={
          values.email === "" ||
          values.firstName === "" ||
          values.lastName === ""
        }
        data-testid={peopleDirectoryTestId.buttons.quickAddSaveBtn}
        shouldBlink={
          ongoingQuickSetup.INVITE_EMPLOYEES &&
          values.email !== "" &&
          values.firstName !== "" &&
          values.lastName !== ""
        }
        isLoading={isPending}
      />
      <Button
        buttonStyle={ButtonStyle.TERTIARY}
        label={"Cancel"}
        endIcon={IconName.CLOSE_ICON}
        styles={{
          marginTop: 2
        }}
        onClick={closeModal}
        data-testid={peopleDirectoryTestId.buttons.quickAddCancelBtn}
      />
    </Stack>
  );
};

export default AddNewResourceModal;
