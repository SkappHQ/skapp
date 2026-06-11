package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Holiday;

import java.util.List;

public interface PeopleEmailService {

	void sendUserInvitationEmail(User user);

	void sendUserTerminationEmail(User user);

	void sendNewHolidayDeclarationEmail(Holiday holiday, List<Employee> employees);

	void sendHolidaySingleDayPendingLeaveRequestCancellationEmployeeEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidayMultipleDayPendingLeaveRequestUpdatedEmployeeEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidayMultipleDayApprovedLeaveRequestUpdatedEmployeeEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidayMultipleDayApprovedLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidayMultipleDayPendingLeaveRequestUpdatedManagerEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidaySingleDayPendingLeaveRequestCancellationManagerEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendHolidaySingleDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest, Holiday holiday);

	void sendPasswordResetRequestManagerEmail(User user, String requestDateTime);

}
