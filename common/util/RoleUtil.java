package com.skapp.enterprise.common.util;

import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.experimental.UtilityClass;

@UtilityClass
public class RoleUtil {

	public boolean isLeaveManagerOrAdmin(Role leaveRole) {
		return leaveRole == Role.LEAVE_MANAGER || leaveRole == Role.LEAVE_ADMIN || leaveRole == Role.SUPER_ADMIN;
	}

	public boolean isAttendanceManagerOrAdmin(Role attendanceRole) {
		return attendanceRole == Role.ATTENDANCE_MANAGER || attendanceRole == Role.ATTENDANCE_ADMIN
				|| attendanceRole == Role.SUPER_ADMIN;
	}

	public boolean isEsignSenderAdminOrSuperAdmin(Role esignRole) {
		return esignRole == Role.ESIGN_SENDER || esignRole == Role.ESIGN_ADMIN || esignRole == Role.SUPER_ADMIN;
	}

	public boolean hasEnvelopeAdminAccess(EmployeeRole employeeRole) {
		boolean isSuperAdmin = Boolean.TRUE.equals(employeeRole.getIsSuperAdmin());
		Role esignRole = employeeRole.getEsignRole();
		Role peopleRole = employeeRole.getPeopleRole();
		boolean hasEsignAccess = esignRole == Role.ESIGN_ADMIN || esignRole == Role.ESIGN_SENDER;
		return isSuperAdmin || (peopleRole == Role.PEOPLE_ADMIN && hasEsignAccess);
	}

}
