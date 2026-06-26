package com.skapp.community.leaveplanner.repository.projection;

import java.time.LocalDate;

public interface EmployeeCustomEntitlementTeamJobRole {

	Long getEmployeeId();

	String getEmployeeName();

	String getTeams();

	String getLeaveType();

	Float getDays();

	LocalDate getStartDate();

	LocalDate getEndDate();

}
