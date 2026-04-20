import { Dispatch, SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { MAX_SUPERVISOR_LIMIT } from "~community/people/constants/configs";
import { SystemPermissionInitialStateType } from "~community/people/types/AddNewResourceTypes";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";
import {
  EmployeeDetails,
  EmployeeRoleType,
  Role,
  TeamResultsType
} from "~community/people/types/EmployeeTypes";
import { isDemoteUser } from "~community/people/utils/PeopleDirectoryUtils";
import { EmployeeRoleLimit } from "~enterprise/people/types/EmployeeTypes";

interface HandleCustomChangeEnterpriseProps {
  name: keyof EmployeeRoleType;
  value: any;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  roleLimitationText: (key: string[]) => string;
  roleLimits: EmployeeRoleLimit;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
}

export const handleCustomChangeEnterprise = ({
  name,
  value,
  setToastMessage,
  roleLimitationText,
  roleLimits,
  setFieldValue,
  setUserRoles
}: HandleCustomChangeEnterpriseProps) => {
  if (
    name === "peopleRole" &&
    value === Role.PEOPLE_ADMIN &&
    roleLimits.peopleAdminLimitExceeded
  ) {
    setToastMessage({
      open: true,
      toastType: "error",
      title: roleLimitationText(["peopleAdminLimitationTitle"]),
      description: roleLimitationText(["peopleAdminLimitationDescription"]),
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
      toastType: "error",
      title: roleLimitationText(["leaveAdminLimitationTitle"]),
      description: roleLimitationText(["leaveAdminLimitationDescription"]),
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
      toastType: "error",
      title: roleLimitationText(["attendanceAdminLimitationTitle"]),
      description: roleLimitationText(["attendanceAdminLimitationDescription"]),
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
      toastType: "error",
      title: roleLimitationText(["peopleManagerLimitationTitle"]),
      description: roleLimitationText(["peopleManagerLimitationDescription"]),
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
      toastType: "error",
      title: roleLimitationText(["leaveManagerLimitationTitle"]),
      description: roleLimitationText(["leaveManagerLimitationDescription"]),
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
      toastType: "error",
      title: roleLimitationText(["attendanceManagerLimitationTitle"]),
      description: roleLimitationText([
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
      title: roleLimitationText(["eSignAdminLimitationTitle"]),
      description: roleLimitationText(["eSignAdminLimitationDescription"]),
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
      title: roleLimitationText(["eSignSenderLimitationTitle"]),
      description: roleLimitationText(["eSignSenderLimitationDescription"]),
      isIcon: true
    });
    return;
  }

  setFieldValue(name, value);
  setUserRoles(name, value);
};

interface HandleCustomChangeDefaultProps {
  name: keyof EmployeeRoleType;
  value: any;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
}

export const handleCustomChangeDefault = ({
  name,
  value,
  setFieldValue,
  setUserRoles
}: HandleCustomChangeDefaultProps) => {
  setFieldValue(name, value);

  if (name === "isSuperAdmin") {
    setUserRoles("isSuperAdmin", value);
  } else if (name === "peopleRole") {
    setUserRoles("peopleRole", value);
  } else if (name === "leaveRole") {
    setUserRoles("leaveRole", value);
  } else if (name === "attendanceRole") {
    setUserRoles("attendanceRole", value);
  } else if (name === "esignRole") {
    setUserRoles("esignRole", value);
  }
};

interface HandleSuperAdminChangeEnterpriseProps {
  checked: boolean;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  roleLimitationText: (key: string[]) => string;
  roleLimits: EmployeeRoleLimit;
  superAdminCount: number;
}

export const handleSuperAdminChangeEnterprise = async ({
  checked,
  setFieldValue,
  setUserRoles,
  setToastMessage,
  roleLimitationText,
  roleLimits,
  superAdminCount
}: HandleSuperAdminChangeEnterpriseProps) => {
  if (!checked && superAdminCount === 1) {
    setToastMessage({
      open: true,
      toastType: "error",
      title: roleLimitationText(["superAdminRequiredTitle"]),
      description: roleLimitationText(["superAdminRequiredDescription"]),
      isIcon: true
    });
    return;
  }

  if (checked && roleLimits.superAdminLimitExceeded) {
    setToastMessage({
      open: true,
      toastType: "error",
      title: roleLimitationText(["superAdminLimitationTitle"]),
      description: roleLimitationText(["superAdminLimitationDescription"]),
      isIcon: true
    });
    return;
  }

  void setFieldValue("isSuperAdmin", checked);
  setUserRoles("isSuperAdmin", checked);

  const peopleRole = Role.PEOPLE_ADMIN;
  const leaveRole = Role.LEAVE_ADMIN;
  const attendanceRole = Role.ATTENDANCE_ADMIN;
  const esignRole = Role.ESIGN_ADMIN;

  void setFieldValue("peopleRole", peopleRole);
  void setFieldValue("leaveRole", leaveRole);
  void setFieldValue("attendanceRole", attendanceRole);
  void setFieldValue("esignRole", esignRole);

  setUserRoles("attendanceRole", attendanceRole);
  setUserRoles("peopleRole", peopleRole);
  setUserRoles("leaveRole", leaveRole);
  setUserRoles("esignRole", esignRole);
};

interface HandleSuperAdminChangeDefaultProps {
  checked: boolean;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  roleLimitationText: (key: string[]) => string;
  superAdminCount: number;
}

export const handleSuperAdminChangeDefault = async ({
  checked,
  setFieldValue,
  setUserRoles,
  setToastMessage,
  roleLimitationText,
  superAdminCount
}: HandleSuperAdminChangeDefaultProps) => {
  if (!checked && superAdminCount === 1) {
    setToastMessage({
      open: true,
      toastType: "error",
      title: roleLimitationText(["superAdminRequiredTitle"]),
      description: roleLimitationText(["superAdminRequiredDescription"]),
      isIcon: true
    });
    return;
  }

  void setFieldValue("isSuperAdmin", checked);
  setUserRoles("isSuperAdmin", checked);

  const peopleRole = Role.PEOPLE_ADMIN;
  const leaveRole = Role.LEAVE_ADMIN;
  const attendanceRole = Role.ATTENDANCE_ADMIN;

  void setFieldValue("peopleRole", peopleRole);
  void setFieldValue("leaveRole", leaveRole);
  void setFieldValue("attendanceRole", attendanceRole);

  setUserRoles("attendanceRole", attendanceRole);
  setUserRoles("peopleRole", peopleRole);
  setUserRoles("leaveRole", leaveRole);
};

const isSupervisingEmployees = (
  employee: EmployeeDetails | undefined
): boolean => (employee?.managers?.length ?? 0) > 0;

const isSupervisingTeams = (employee: EmployeeDetails | undefined): boolean => {
  const teams = employee?.teams as TeamResultsType[];

  return (
    teams.some((team: TeamResultsType) => team?.team?.isSupervisor) ?? false
  );
};

interface HandleNextBtnClickProps {
  isUpdate: boolean;
  systemPermissionsText: (key: string[]) => string;
  employee: EmployeeDetails | undefined;
  setToastMessage: Dispatch<SetStateAction<ToastProps>>;
  superAdminCount: number;
  setModalDescription: Dispatch<SetStateAction<string>>;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  values: SystemPermissionInitialStateType;
  onNext: () => void;
  setUpdateEmployeeStatus?: Dispatch<
    SetStateAction<EditAllInformationFormStatus>
  >;
}

export const handleNextBtnClick = async ({
  isUpdate,
  systemPermissionsText,
  employee,
  setToastMessage,
  superAdminCount,
  setModalDescription,
  setOpenModal,
  values,
  setUpdateEmployeeStatus,
  onNext
}: HandleNextBtnClickProps) => {
  if (isUpdate) {
    if (
      isDemoteUser(employee, values) &&
      (isSupervisingTeams(employee) || isSupervisingEmployees(employee))
    ) {
      if (isSupervisingEmployees(employee))
        setModalDescription(
          systemPermissionsText(["demoteUserSupervisingEmployee"])
        );
      else
        setModalDescription(
          systemPermissionsText(["demoteUserSupervisingTeams"])
        );

      setOpenModal(true);
    } else {
      if (
        employee &&
        !employee?.userRoles?.isSuperAdmin &&
        values.isSuperAdmin &&
        superAdminCount &&
        superAdminCount >= MAX_SUPERVISOR_LIMIT
      ) {
        setToastMessage({
          toastType: ToastType.ERROR,
          title: systemPermissionsText(["maxSupervisorCountReached"]),
          description: systemPermissionsText([
            "maxSupervisorCountReachedDescription"
          ]),
          open: true
        });
      } else {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
        onNext();
      }
    }
  } else {
    if (
      values.isSuperAdmin &&
      superAdminCount &&
      superAdminCount >= MAX_SUPERVISOR_LIMIT
    ) {
      setToastMessage({
        toastType: ToastType.ERROR,
        title: systemPermissionsText(["maxSupervisorCountReached"]),
        open: true
      });
    } else {
      setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
      onNext();
    }
  }
};

interface HandleSystemPermissionFormSubmitProps {
  values: EmployeeRoleType;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
}

export const handleSystemPermissionFormSubmit = ({
  values,
  setUserRoles
}: HandleSystemPermissionFormSubmitProps) => {
  setUserRoles("isSuperAdmin", values.isSuperAdmin);
  setUserRoles("attendanceRole", values.attendanceRole);
  setUserRoles("peopleRole", values.peopleRole);
  setUserRoles("leaveRole", values.leaveRole);
  setUserRoles("esignRole", values.esignRole);
};

interface HandleModalClose {
  employee: EmployeeDetails | undefined;
  setUserRoles: (key: keyof EmployeeRoleType, value: Role | boolean) => void;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setModalDescription: Dispatch<SetStateAction<string>>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
}

export const handleModalClose = ({
  employee,
  setUserRoles,
  setFieldValue,
  setModalDescription,
  setOpenModal
}: HandleModalClose) => {
  if (employee) {
    const roles = [
      "isSuperAdmin",
      "peopleRole",
      "leaveRole",
      "attendanceRole"
    ] as const;

    roles.forEach((role) => {
      setUserRoles(role, employee.userRoles[role]);
      void setFieldValue(role, employee.userRoles[role]);
    });
  }

  setModalDescription("");
  setOpenModal(false);
};
