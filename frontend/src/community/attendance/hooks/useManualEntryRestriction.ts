import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";
import useTier from "~enterprise/common/hooks/useTier";

export interface ManualEntryRestrictionResult {
  isManualEntryRestricted: boolean;
  isRestrictionEnabled: boolean;
  canDirectlyAddOrEditEntry: boolean;
  isLoading: boolean;
  isError: boolean;
}

const useManualEntryRestriction = (): ManualEntryRestrictionResult => {
  const { data, isPending, isError } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();
  const { isAtLeastCoreTier } = useTier();

  const attendanceConfig: AttendanceConfigurationType | undefined = data;

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  // Mirrors the server-side gate: the restriction is only enforced on Core and
  // Pro tiers, so a stale config flag on a downgraded tenant must be ignored.
  const isRestrictionEnabled =
    isAtLeastCoreTier &&
    Boolean(attendanceConfig?.isManualTimeEntryRestrictionEnabled);

  // Loading and error are reported separately so callers can show a pending
  // state instead of a restriction the config has not actually confirmed.
  const isManualEntryRestricted = !canManageTimeEntries && isRestrictionEnabled;

  const canDirectlyAddOrEditEntry =
    !isError && isRestrictionEnabled && canManageTimeEntries;

  return {
    isManualEntryRestricted,
    isRestrictionEnabled,
    canDirectlyAddOrEditEntry,
    isLoading: isPending,
    isError
  };
};

export default useManualEntryRestriction;
