import { useSession } from "next-auth/react";
import { useMemo } from "react";

import {
  AdminTypes,
  ManagerTypes as AuthManagerType,
  EmployeeTypes,
  SenderTypes
} from "~community/common/types/AuthTypes";
import { ManagerTypes } from "~community/common/types/CommonTypes";
import { TierEnum } from "~enterprise/common/enums/Common";

const useSessionData = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const isFreeTier = useMemo(
    () => sessionData?.user?.tier === TierEnum.FREE,
    [sessionData?.user?.tier]
  );

  const isProTier = useMemo(
    () => sessionData?.user?.tier === TierEnum.PRO,
    [sessionData?.user?.tier]
  );

  const isLeaveModuleEnabled = useMemo(
    () => sessionData?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE),
    [sessionData?.user?.roles]
  );

  const isAttendanceModuleEnabled = useMemo(
    () => sessionData?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE),
    [sessionData?.user?.roles]
  );

  const isEsignatureModuleEnabled = useMemo(
    () => sessionData?.user?.roles?.includes(EmployeeTypes.ESIGN_EMPLOYEE),
    [sessionData?.user?.roles]
  );

  const isInvoiceModuleEnabled = useMemo(
    () => sessionData?.user?.roles?.includes(AuthManagerType.INVOICE_MANAGER),
    [sessionData?.user?.roles]
  );

  const employeeDetails = useMemo(
    () => sessionData?.user?.employee,
    [sessionData?.user?.employee]
  );

  const isSuperAdmin = useMemo(
    () => sessionData?.user?.roles?.includes(AdminTypes.SUPER_ADMIN),
    [sessionData?.user?.roles]
  );

  const isPeopleAdmin = useMemo(
    () => sessionData?.user?.roles?.includes(AdminTypes.PEOPLE_ADMIN),
    [sessionData?.user?.roles]
  );

  const isEmployee = useMemo(() => {
    return !sessionData?.user?.roles?.some((role) => {
      return [
        ...Object.values(AdminTypes),
        ...Object.values(ManagerTypes)
      ].includes(role as AdminTypes | ManagerTypes);
    });
  }, [sessionData?.user?.roles]);

  const isPeopleManager = useMemo(
    () => sessionData?.user?.roles?.includes(AuthManagerType.PEOPLE_MANAGER),
    [sessionData?.user?.roles]
  );

  const userId = useMemo(
    () => sessionData?.user?.userId,
    [sessionData?.user?.userId]
  );

  const isLeaveEmployee = useMemo(
    () => sessionData?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE),
    [sessionData?.user?.roles]
  );

  const isLeaveManager = useMemo(
    () => sessionData?.user?.roles?.includes(AuthManagerType.LEAVE_MANAGER),
    [sessionData?.user?.roles]
  );

  const isAttendanceEmployee = useMemo(
    () => sessionData?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE),
    [sessionData?.user?.roles]
  );

  const isAttendanceManager = useMemo(
    () =>
      sessionData?.user?.roles?.includes(AuthManagerType.ATTENDANCE_MANAGER),
    [sessionData?.user?.roles]
  );

  const isESignSender = useMemo(
    () => sessionData?.user?.roles?.includes(SenderTypes.ESIGN_SENDER),
    [sessionData?.user?.roles]
  );

  const tenantID = useMemo(
    () => sessionData?.user?.tenantId,
    [sessionData?.user?.tenantId]
  );

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
    sessionStatus,
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
