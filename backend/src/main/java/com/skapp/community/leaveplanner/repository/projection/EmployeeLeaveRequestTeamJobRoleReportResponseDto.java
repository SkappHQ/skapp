package com.skapp.community.leaveplanner.repository.projection;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;

import java.time.LocalDate;

public interface EmployeeLeaveRequestTeamJobRoleReportResponseDto {

	Long getEmployeeId();

	String getAuthPic();

	String getFirstName();

	String getLastName();

	String getTeams();

	String getLeaveType();

	LeaveRequestStatus getStatus();

	LocalDate getStartDate();

	LocalDate getEndDate();

	String getLeaveTypeEmoji();

	float getDays();

}
