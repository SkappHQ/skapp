import { useMemo } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import {
  AdminTypes,
  ManagerTypes as AuthManagerType,
  EmployeeTypes,
  RepresentativeTypes,
  SenderTypes
} from "~community/common/types/AuthTypes";
import { ManagerTypes } from "~community/common/types/CommonTypes";
import { TierEnum } from "~enterprise/common/enums/Common";

import { tenantID } from "../utils/axiosInterceptor";

const useSessionData = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  const isFreeTier = useMemo(() => {
    if (user?.tier !== undefined) {
      return user.tier === TierEnum.FREE;
    }
    return (
      (user?.tiers?.includes(TierEnum.FREE) &&
        !user?.tiers?.includes(TierEnum.CORE) &&
        !user?.tiers?.includes(TierEnum.PRO)) ??
      false
    );
  }, [user?.tier, user?.tiers]);

  const isProTier = useMemo(() => {
    if (user?.tier !== undefined) {
      return user.tier === TierEnum.PRO || user.tier === TierEnum.CORE;
    }
    return (
      (user?.tiers?.includes(TierEnum.PRO) ||
        user?.tiers?.includes(TierEnum.CORE)) ??
      false
    );
  }, [user?.tier, user?.tiers]);

  const isLeaveModuleEnabled = useMemo(
    () => user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE),
    [user?.roles]
  );

  const isAttendanceModuleEnabled = useMemo(
    () => user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE),
    [user?.roles]
  );

  const isEsignatureModuleEnabled = useMemo(
    () => user?.roles?.includes(EmployeeTypes.ESIGN_EMPLOYEE),
    [user?.roles]
  );

  const isInvoiceModuleEnabled = useMemo(
    () => user?.roles?.includes(AuthManagerType.INVOICE_MANAGER),
    [user?.roles]
  );

  const isPmModuleEnabled = useMemo(
    () => user?.roles?.includes(EmployeeTypes.PM_EMPLOYEE),
    [user?.roles]
  );

  const employeeDetails = useMemo(() => user?.employee, [user?.employee]);

  const isSuperAdmin = useMemo(
    () => user?.roles?.includes(AdminTypes.SUPER_ADMIN),
    [user?.roles]
  );

  const isPeopleAdmin = useMemo(
    () => user?.roles?.includes(AdminTypes.PEOPLE_ADMIN),
    [user?.roles]
  );

  const isEmployee = useMemo(() => {
    return !user?.roles?.some((role) => {
      return [
        ...Object.values(AdminTypes),
        ...Object.values(ManagerTypes)
      ].includes(role as AdminTypes | ManagerTypes);
    });
  }, [user?.roles]);

  const isPeopleManager = useMemo(
    () => user?.roles?.includes(AuthManagerType.PEOPLE_MANAGER),
    [user?.roles]
  );

  const userId = useMemo(() => user?.userId, [user?.userId]);

  const isLeaveEmployee = useMemo(
    () => user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE),
    [user?.roles]
  );

  const isLeaveManager = useMemo(
    () => user?.roles?.includes(AuthManagerType.LEAVE_MANAGER),
    [user?.roles]
  );

  const isAttendanceEmployee = useMemo(
    () => user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE),
    [user?.roles]
  );

  const isAttendanceManager = useMemo(
    () => user?.roles?.includes(AuthManagerType.ATTENDANCE_MANAGER),
    [user?.roles]
  );

  const isESignSender = useMemo(
    () => user?.roles?.includes(SenderTypes.ESIGN_SENDER),
    [user?.roles]
  );

  const isPmAdmin = useMemo(
    () => user?.roles?.includes(AdminTypes.PM_ADMIN),
    [user?.roles]
  );

  const isInvoiceAdmin = useMemo(
    () => user?.roles?.includes(AdminTypes.INVOICE_ADMIN),
    [user?.roles]
  );

  const isCrmAdmin = useMemo(
    () => user?.roles?.includes(AdminTypes.CRM_ADMIN),
    [user?.roles]
  );

  const isCrmSalesManager = useMemo(
    () => user?.roles?.includes(AuthManagerType.CRM_SALES_MANAGER),
    [user?.roles]
  );

  const isCrmSalesRepresentative = useMemo(
    () => user?.roles?.includes(RepresentativeTypes.CRM_SALES_REPRESENTATIVE),
    [user?.roles]
  );

  const isCrmModuleEnabled = useMemo(
    () => isCrmSalesRepresentative,
    [user?.roles]
  );

  return {
    isFreeTier,
    isProTier,
    isAttendanceModuleEnabled,
    isLeaveModuleEnabled,
    isEsignatureModuleEnabled,
    isInvoiceModuleEnabled,
    isPmModuleEnabled,
    employeeDetails,
    isSuperAdmin,
    isPeopleAdmin,
    isEmployee,
    sessionStatus: isLoading
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated",
    isPeopleManager,
    userId,
    isLeaveEmployee,
    isLeaveManager,
    isAttendanceEmployee,
    isAttendanceManager,
    isESignSender,
    isPmAdmin,
    isInvoiceAdmin,
    isCrmAdmin,
    isCrmSalesManager,
    isCrmSalesRepresentative,
    isCrmModuleEnabled,
    tenantID
  };
};

export default useSessionData;
