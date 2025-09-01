import { useCallback, useEffect, useState } from "react";

import { appModes } from "~community/common/constants/configs";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetAllowedGrantablePermissions,
  useGetSuperAdminCount
} from "~community/configurations/api/userRolesApi";
import { usePeopleStore } from "~community/people/store/store";
import { L2SystemPermissionsType } from "~community/people/types/PeopleTypes";
import { useGetRoleLimits } from "~enterprise/common/api/peopleApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { EmployeeRoleLimit } from "~enterprise/people/types/EmployeeTypes";

import { Role } from "../enums/PeopleEnums";

type RoleLimitEntry = {
  limitExceeded: boolean;
  title: string;
  description: string;
};

type RoleLimitMapping = {
  [K in keyof L2SystemPermissionsType]?: {
    [R in Role]?: RoleLimitEntry;
  };
};

const useSystemPermissionFormHandlers = () => {
  const translateText = useTranslator("peopleModule", "roleLimitation");

  const environment = useGetEnvironment();
  const { setToastMessage } = useToast();
  const {
    employee,
    setSystemPermissions,
    initialEmployee,
    superAdminCount,
    setSuperAdminCount
  } = usePeopleStore((state) => state);

  const [permissions, setPermissions] = useState<L2SystemPermissionsType>(
    employee?.systemPermissions || {}
  );
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

  const { data: superAdminCountData } = useGetSuperAdminCount();
  const { data: grantablePermission } = useGetAllowedGrantablePermissions();
  const { data: roleLimitsData } = useGetRoleLimits(
    environment === appModes.ENTERPRISE
  );

  useEffect(() => {
    if (roleLimitsData) {
      setRoleLimits(roleLimitsData);
    }
  }, [roleLimitsData]);

  useEffect(() => {
    setPermissions(employee?.systemPermissions || {});
  }, [employee]);

  useEffect(() => {
    if (superAdminCountData && superAdminCount === 0) {
      setSuperAdminCount(superAdminCountData);
    }
  }, [superAdminCountData, superAdminCount, setSuperAdminCount]);

  const roleLimitMapping: RoleLimitMapping = {
    peopleRole: {
      [Role.PEOPLE_ADMIN]: {
        limitExceeded: roleLimits.peopleAdminLimitExceeded,
        title: "peopleAdminLimitationTitle",
        description: "peopleAdminLimitationDescription"
      },
      [Role.PEOPLE_MANAGER]: {
        limitExceeded: roleLimits.peopleManagerLimitExceeded,
        title: "peopleManagerLimitationTitle",
        description: "peopleManagerLimitationDescription"
      }
    },
    leaveRole: {
      [Role.LEAVE_ADMIN]: {
        limitExceeded: roleLimits.leaveAdminLimitExceeded,
        title: "leaveAdminLimitationTitle",
        description: "leaveAdminLimitationDescription"
      },
      [Role.LEAVE_MANAGER]: {
        limitExceeded: roleLimits.leaveManagerLimitExceeded,
        title: "leaveManagerLimitationTitle",
        description: "leaveManagerLimitationDescription"
      }
    },
    attendanceRole: {
      [Role.ATTENDANCE_ADMIN]: {
        limitExceeded: roleLimits.attendanceAdminLimitExceeded,
        title: "attendanceAdminLimitationTitle",
        description: "attendanceAdminLimitationDescription"
      },
      [Role.ATTENDANCE_MANAGER]: {
        limitExceeded: roleLimits.attendanceManagerLimitExceeded,
        title: "attendanceManagerLimitationTitle",
        description: "attendanceManagerLimitationDescription"
      }
    },
    esignRole: {
      [Role.ESIGN_ADMIN]: {
        limitExceeded: roleLimits.esignAdminLimitExceeded,
        title: "eSignAdminLimitationTitle",
        description: "eSignAdminLimitationDescription"
      },
      [Role.ESIGN_SENDER]: {
        limitExceeded: roleLimits.esignSenderLimitExceeded,
        title: "eSignSenderLimitationTitle",
        description: "eSignSenderLimitationDescription"
      }
    }
  };

  const handleRoleDropdown = (
    name: keyof L2SystemPermissionsType,
    value: Role
  ) => {
    if (environment === appModes.ENTERPRISE) {
      const roleData = roleLimitMapping[name]?.[value];

      if (roleData?.limitExceeded) {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText([roleData.title]),
          description: translateText([roleData.description]),
          isIcon: true
        });
        return;
      }
    }
    setPermissions((prev) => ({ ...prev, [name]: value }));
    setSystemPermissions({ [name]: value });
  };

  const handleSuperAdminToggle = useCallback(
    (checked: boolean) => {
      let newSuperAdminCount = superAdminCount;

      if (checked) {
        newSuperAdminCount++;
      } else {
        if (newSuperAdminCount > 0) {
          newSuperAdminCount--;
        }
      }

      if (!checked && newSuperAdminCount === 0) {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["superAdminRequiredTitle"]),
          description: translateText(["superAdminRequiredDescription"]),
          isIcon: true
        });
        return;
      }

      if (
        checked &&
        !initialEmployee?.systemPermissions?.isSuperAdmin &&
        roleLimits.superAdminLimitExceeded
      ) {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["superAdminLimitationTitle"]),
          description: translateText(["superAdminLimitationDescription"]),
          isIcon: true
        });
        return;
      }

      setSuperAdminCount(newSuperAdminCount);

      setPermissions({
        isSuperAdmin: checked,
        leaveRole: Role.LEAVE_ADMIN,
        attendanceRole: Role.ATTENDANCE_ADMIN,
        peopleRole: Role.PEOPLE_ADMIN,
        esignRole: Role.ESIGN_ADMIN,
        pmRole: Role.PM_ADMIN,
        invoiceRole: Role.INVOICE_ADMIN
      });
      setSystemPermissions({
        isSuperAdmin: checked,
        leaveRole: Role.LEAVE_ADMIN,
        attendanceRole: Role.ATTENDANCE_ADMIN,
        peopleRole: Role.PEOPLE_ADMIN,
        esignRole: Role.ESIGN_ADMIN,
        pmRole: Role.PM_ADMIN,
        invoiceRole: Role.INVOICE_ADMIN
      });
    },
    [
      superAdminCount,
      roleLimits,
      setSystemPermissions,
      setToastMessage,
      translateText,
      initialEmployee,
      setSuperAdminCount
    ]
  );

  return {
    permissions,
    grantablePermission,
    handleRoleDropdown,
    handleSuperAdminToggle,
    roleLimitMapping
  };
};

export default useSystemPermissionFormHandlers;
