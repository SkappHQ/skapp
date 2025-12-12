import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { appModes } from "~community/common/constants/configs";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useGetSuperAdminCount } from "~community/configurations/api/userRolesApi";
import { AllowedGrantableRolesType } from "~community/configurations/types/UserRolesTypes";
import { useHasSupervisorRoles } from "~community/people/api/PeopleApi";
import { MAX_SUPERVISOR_LIMIT } from "~community/people/constants/configs";
import {
  AccountStatusTypes,
  Role,
  RoleModuleEnum,
  RoleNameEnum
} from "~community/people/enums/PeopleEnums";
import useStepper from "~community/people/hooks/useStepper";
import useSystemPermissionFormHandlers from "~community/people/hooks/useSystemPermissionFormHandlers";
import { usePeopleStore } from "~community/people/store/store";
import { L2SystemPermissionsType } from "~community/people/types/PeopleTypes";
import { useHandlePeopleEdit } from "~community/people/utils/peopleEditFlowUtils/useHandlePeopleEdit";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

import AddSectionButtonWrapper from "../../molecules/AddSectionButtonWrapper/AddSectionButtonWrapper";
import EditSectionButtonWrapper from "../../molecules/EditSectionButtonWrapper/EditSectionButtonWrapper";
import PeopleFormSectionWrapper from "../PeopleFormSectionWrapper/PeopleFormSectionWrapper";
import SystemCredentials from "../SystemCredentials/SystemCredentials";
import styles from "./styles";

interface Props {
  isProfileView?: boolean;
  isUpdate?: boolean;
  isAddFlow?: boolean;
  isReadOnly?: boolean;
}

const SystemPermissionFormSection = ({
  isProfileView,
  isUpdate,
  isAddFlow,
  isReadOnly = false
}: Props) => {
  const classes = styles();
  const environment = useGetEnvironment();

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "systemPermissions"
  );
  const commonText = useTranslator("peopleModule", "addResource", "commonText");
  const roleTranslateText = useTranslator("peopleModule", "roleLimitation");

  const [openModal, setOpenModal] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const {
    employee,
    nextStep,
    initialEmployee,
    isUnsavedModalSaveButtonClicked,
    isUnsavedModalDiscardButtonClicked,
    isCancelModalConfirmButtonClicked,
    setEmployee,
    setIsUnsavedChangesModalOpen,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setCurrentStep,
    setIsCancelChangesModalOpen,
    setIsCancelModalConfirmButtonClicked
  } = usePeopleStore((state) => state);

  const { handleMutate } = useHandlePeopleEdit();

  const { data: supervisedData } = useHasSupervisorRoles(
    Number(employee.common?.employeeId)
  );

  const { data: superAdminCount } = useGetSuperAdminCount();
  const { setToastMessage } = useToast();

  const {
    permissions,
    grantablePermission,
    handleRoleDropdown,
    handleSuperAdminToggle,
    roleLimitMapping
  } = useSystemPermissionFormHandlers();

  const {
    isAttendanceModuleEnabled,
    isLeaveModuleEnabled,
    isEsignatureModuleEnabled,
    isSuperAdmin,
    isInvoiceModuleEnabled,
    tenantID
  } = useSessionData();

  const { handleNext } = useStepper();

  const isInputsDisabled =
    employee?.common?.accountStatus === AccountStatusTypes.TERMINATED;

  const onSave = () => {
    if (
      initialEmployee.systemPermissions?.isSuperAdmin &&
      !employee.systemPermissions?.isSuperAdmin
    ) {
      const rolesToAssign = {
        peopleRole: employee?.systemPermissions?.peopleRole,
        leaveRole: employee?.systemPermissions?.leaveRole,
        attendanceRole: employee?.systemPermissions?.attendanceRole,
        esignRole: employee?.systemPermissions?.esignRole,
        invoiceRole: employee?.systemPermissions?.invoiceRole
      };

      const errorsToShow = [];

      for (const [roleKey, roleValue] of Object.entries(rolesToAssign)) {
        const roleData =
          roleLimitMapping[roleKey as keyof L2SystemPermissionsType]?.[
            roleValue as Role
          ];
        if (roleData?.limitExceeded) {
          errorsToShow.push(roleData);
        }
      }

      if (errorsToShow.length > 1) {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: roleTranslateText(["userRoleLimitationTitle"]),
          description: roleTranslateText(["userRoleLimitationDescription"]),
          isIcon: true
        });
      } else if (errorsToShow.length === 1) {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: roleTranslateText([errorsToShow[0]?.title]),
          description: roleTranslateText([errorsToShow[0]?.description]),
          isIcon: true
        });
      }

      if (errorsToShow.length > 0) {
        return;
      }
    }
    if (
      (employee?.systemPermissions?.peopleRole === Role.PEOPLE_EMPLOYEE ||
        employee?.systemPermissions?.leaveRole === Role.LEAVE_EMPLOYEE ||
        employee?.systemPermissions?.attendanceRole ===
          Role.ATTENDANCE_EMPLOYEE) &&
      (initialEmployee?.systemPermissions?.peopleRole === Role.PEOPLE_ADMIN ||
        initialEmployee?.systemPermissions?.peopleRole ===
          Role.PEOPLE_MANAGER) &&
      (supervisedData?.isPrimaryManager || supervisedData?.isTeamSupervisor)
    ) {
      if (supervisedData?.isPrimaryManager) {
        setModalDescription(translateText(["demoteUserSupervisingEmployee"]));
        setOpenModal(true);
      } else if (supervisedData?.isTeamSupervisor) {
        setModalDescription(translateText(["demoteUserSupervisingTeams"]));
        setOpenModal(true);
      }
    } else if (
      employee.systemPermissions?.isSuperAdmin &&
      initialEmployee.systemPermissions?.isSuperAdmin &&
      superAdminCount >= MAX_SUPERVISOR_LIMIT
    ) {
      setToastMessage({
        toastType: ToastType.ERROR,
        title: translateText(["maxSupervisorCountReached"]),
        description: translateText(["maxSupervisorCountReachedDescription"]),
        open: true
      });
    } else {
      if (isAddFlow) {
        handleNext();
      } else {
        setCurrentStep(nextStep);
        setIsUnsavedChangesModalOpen(false);
        setIsUnsavedModalSaveButtonClicked(false);

        handleMutate();
      }
      setEmployee(employee);
    }
  };
  const onCancel = () => {
    setEmployee(initialEmployee);
    setIsUnsavedChangesModalOpen(false);
    setIsUnsavedModalDiscardButtonClicked(false);
    setIsCancelChangesModalOpen(false);
    setIsCancelModalConfirmButtonClicked(false);
  };

  const handleCancel = () => {
    setIsCancelChangesModalOpen(true);
  };

  useEffect(() => {
    if (isUnsavedModalSaveButtonClicked) {
      onSave();
    } else if (isUnsavedModalDiscardButtonClicked) {
      onCancel();
    }
  }, [isUnsavedModalDiscardButtonClicked, isUnsavedModalSaveButtonClicked]);

  useEffect(() => {
    if (isCancelModalConfirmButtonClicked) {
      onCancel();
    }
  }, [isCancelModalConfirmButtonClicked]);

  const isRoleMissing = (
    category: keyof AllowedGrantableRolesType,
    roleLabel: string
  ) => {
    return !grantablePermission?.[category]?.some(
      (role) => role.label === roleLabel
    );
  };

  return (
    <Box role="region" aria-labelledby="page-title subtitle-next-to-title">
      <PeopleFormSectionWrapper
        title={translateText(["title"])}
        pageHead={translateText(["head"])}
        containerStyles={classes.layoutContainerStyles}
        dividerStyles={classes.layoutDividerStyles}
      >
        <>
          {(isSuperAdmin || employee?.systemPermissions?.isSuperAdmin) && (
            <SwitchRow
              labelId="super-admin"
              label={translateText(["superAdmin"])}
              disabled={!isSuperAdmin}
              checked={permissions.isSuperAdmin as boolean}
              onChange={(checked: boolean) => handleSuperAdminToggle(checked)}
              wrapperStyles={classes.switchRowWrapper}
              icon={!isInputsDisabled ? IconName.SUPER_ADMIN_ICON : undefined}
            />
          )}

          <Stack sx={classes.dropdownContainer}>
            {!isRoleMissing(RoleModuleEnum.PEOPLE, RoleNameEnum.ADMIN) &&
              !isRoleMissing(RoleModuleEnum.PEOPLE, RoleNameEnum.MANAGER) && (
                <DropdownList
                  inputName={"peopleRole"}
                  label={translateText(["people"])}
                  itemList={grantablePermission?.people || []}
                  value={permissions.peopleRole}
                  componentStyle={classes.dropdownListComponentStyles}
                  checkSelected
                  onChange={(event) =>
                    handleRoleDropdown("peopleRole", event.target.value as Role)
                  }
                  isDisabled={
                    isProfileView ||
                    permissions.isSuperAdmin ||
                    isInputsDisabled ||
                    isReadOnly
                  }
                />
              )}

            {isLeaveModuleEnabled &&
              !isRoleMissing(RoleModuleEnum.LEAVE, RoleNameEnum.ADMIN) &&
              !isRoleMissing(RoleModuleEnum.LEAVE, RoleNameEnum.MANAGER) && (
                <DropdownList
                  inputName={"leaveRole"}
                  label={translateText(["leave"])}
                  itemList={grantablePermission?.leave || []}
                  value={permissions.leaveRole}
                  checkSelected
                  componentStyle={classes.dropdownListComponentStyles}
                  onChange={(event) =>
                    handleRoleDropdown("leaveRole", event.target.value as Role)
                  }
                  isDisabled={
                    isProfileView ||
                    permissions.isSuperAdmin ||
                    isInputsDisabled ||
                    isReadOnly
                  }
                />
              )}

            {isAttendanceModuleEnabled &&
              !isRoleMissing(RoleModuleEnum.ATTENDANCE, RoleNameEnum.ADMIN) &&
              !isRoleMissing(
                RoleModuleEnum.ATTENDANCE,
                RoleNameEnum.MANAGER
              ) && (
                <DropdownList
                  inputName={"attendanceRole"}
                  label={translateText(["attendance"])}
                  itemList={grantablePermission?.attendance || []}
                  value={permissions.attendanceRole}
                  componentStyle={classes.dropdownListComponentStyles}
                  checkSelected
                  onChange={(event) =>
                    handleRoleDropdown(
                      "attendanceRole",
                      event.target.value as Role
                    )
                  }
                  isDisabled={
                    isProfileView ||
                    permissions.isSuperAdmin ||
                    isInputsDisabled ||
                    isReadOnly
                  }
                />
              )}

            {isEsignatureModuleEnabled &&
              !isRoleMissing(RoleModuleEnum.ESIGN, RoleNameEnum.ADMIN) &&
              !isRoleMissing(RoleModuleEnum.ESIGN, RoleNameEnum.SENDER) && (
                <DropdownList
                  inputName={"esignRole"}
                  label={translateText(["eSignature"])}
                  itemList={grantablePermission?.esign || []}
                  value={permissions.esignRole}
                  componentStyle={classes.dropdownListComponentStyles}
                  checkSelected
                  onChange={(event) =>
                    handleRoleDropdown("esignRole", event.target.value as Role)
                  }
                  isDisabled={
                    isProfileView ||
                    permissions.isSuperAdmin ||
                    isInputsDisabled ||
                    isReadOnly
                  }
                />
              )}

            {!isRoleMissing(RoleModuleEnum.PM, RoleNameEnum.ADMIN) && (
              <DropdownList
                inputName={"pmRole"}
                label={translateText(["projectManagement"])}
                itemList={grantablePermission?.pm || []}
                value={permissions.pmRole}
                componentStyle={classes.dropdownListComponentStyles}
                checkSelected
                onChange={(event) =>
                  handleRoleDropdown("pmRole", event.target.value as Role)
                }
                isDisabled={
                  isProfileView ||
                  permissions.isSuperAdmin ||
                  isInputsDisabled ||
                  isReadOnly
                }
              />
            )}

            {isInvoiceModuleEnabled &&
              !isRoleMissing(RoleModuleEnum.INVOICE, RoleNameEnum.ADMIN) &&
              !isRoleMissing(RoleModuleEnum.INVOICE, RoleNameEnum.MANAGER) && (
                <DropdownList
                  inputName={"invoiceRole"}
                  label={translateText(["invoice"])}
                  itemList={grantablePermission?.invoice || []}
                  placeholder={translateText(["selectRole"])}
                  value={
                    permissions.invoiceRole === Role.INVOICE_NONE
                      ? ""
                      : permissions.invoiceRole
                  }
                  componentStyle={classes.dropdownListComponentStyles}
                  checkSelected
                  onChange={(event) =>
                    handleRoleDropdown(
                      "invoiceRole",
                      event.target.value as Role
                    )
                  }
                  isDisabled={
                    isProfileView ||
                    permissions.isSuperAdmin ||
                    isInputsDisabled ||
                    isReadOnly
                  }
                />
              )}
          </Stack>

          {isUpdate &&
            !isInputsDisabled &&
            environment === appModes.COMMUNITY && <SystemCredentials />}

          {!isInputsDisabled &&
            (isAddFlow ? (
              <AddSectionButtonWrapper onNextClick={onSave} />
            ) : (
              <EditSectionButtonWrapper
                onCancelClick={handleCancel}
                onSaveClick={onSave}
              />
            ))}

          <Modal
            isModalOpen={openModal}
            title={translateText(["alert"])}
            onCloseModal={() => {
              setOpenModal(false);
              setModalDescription("");
            }}
          >
            <Stack sx={classes.modalContainer}>
              <Typography>{modalDescription}</Typography>
              <Button
                buttonStyle={ButtonStyle.PRIMARY}
                label={commonText(["okay"])}
                onClick={() => {
                  setOpenModal(false);
                }}
              />
            </Stack>
          </Modal>
        </>
      </PeopleFormSectionWrapper>
    </Box>
  );
};

export default SystemPermissionFormSection;
