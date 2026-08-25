import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import useSessionData from "~community/common/hooks/useSessionData";

/**
 * Resolves whether the signed in user is blocked from adding or editing time entries
 * by the organization level "Restrict Manual Time Entries & Edits" setting. Attendance
 * Managers, Attendance Admins and Super Admins keep their access while it is enabled.
 *
 * Everyone else is treated as restricted until the configuration resolves, so no entry
 * point is offered while it is unknown whether the server would reject the request.
 *
 * The setting is enforced server side as well, so this only drives what is rendered.
 */
const useManualEntryRestriction = () => {
  const { data, isPending } = useGetAttendanceConfiguration();
  const { isSuperAdmin, isAttendanceAdmin, isAttendanceManager } =
    useSessionData();

  const attendanceConfig: AttendanceConfigurationType | undefined = data;

  const canManageTimeEntries = Boolean(
    isSuperAdmin || isAttendanceAdmin || isAttendanceManager
  );

  const isManualEntryRestricted =
    !canManageTimeEntries &&
    (isPending || Boolean(attendanceConfig?.isManualEntryRestrictionEnabled));

  return { isManualEntryRestricted };
};

export default useManualEntryRestriction;
