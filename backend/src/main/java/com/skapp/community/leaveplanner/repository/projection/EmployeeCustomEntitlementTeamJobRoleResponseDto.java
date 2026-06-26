package com.skapp.community.leaveplanner.repository.projection;

import java.time.LocalDate;

public interface EmployeeCustomEntitlementTeamJobRoleResponseDto {

	Long getEmployeeId();

	String getEmployeeName();

	String getFirstName();

	String getLastName();

	String getAuthPic();

	String getTeams();

	String getLeaveType();

	Float getDays();

	LocalDate getStartDate();

	LocalDate getEndDate();

	String getLeaveTypeEmoji();

}
