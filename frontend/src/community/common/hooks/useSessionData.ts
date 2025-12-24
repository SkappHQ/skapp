import { useMemo } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import {
  AdminTypes,
  ManagerTypes as AuthManagerType,
  EmployeeTypes,
  SenderTypes
} from "~community/common/types/AuthTypes";
import { ManagerTypes } from "~community/common/types/CommonTypes";
import { TierEnum } from "~enterprise/common/enums/Common";

const useSessionData = () => {
  const { user, isLoading } = useAuth();

  const isFreeTier = useMemo(() => user?.tier === TierEnum.FREE, [user?.tier]);

  const isProTier = useMemo(() => user?.tier === TierEnum.PRO, [user?.tier]);

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

  const tenantID = useMemo(() => user?.tenantId, [user?.tenantId]);

  return {
    isFreeTier,
    isProTier,
    isAttendanceModuleEnabled,
    isLeaveModuleEnabled,
    isEsignatureModuleEnabled,
    isInvoiceModuleEnabled,
    employeeDetails,
    isSuperAdmin,
    isPeopleAdmin,
    isEmployee,
    sessionStatus: isLoading
      ? "loading"
      : user
        ? "authenticated"
        : "unauthenticated",
    isPeopleManager,
    userId,
    isLeaveEmployee,
    isLeaveManager,
    isAttendanceEmployee,
    isAttendanceManager,
    isESignSender,
    tenantID
  };
};

export default useSessionData;
