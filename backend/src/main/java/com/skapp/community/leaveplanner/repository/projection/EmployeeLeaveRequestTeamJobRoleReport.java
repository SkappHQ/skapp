package com.skapp.community.leaveplanner.repository.projection;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;

public interface EmployeeLeaveRequestTeamJobRoleReport {

	Long getEmployeeId();

	String getEmployeeName();

	String getTeams();

	String getLeaveType();

	LeaveRequestStatus getStatus();

	String getReason();

	String getLeavePeriod();

	String getDateRequested();

	float getDays();

}
