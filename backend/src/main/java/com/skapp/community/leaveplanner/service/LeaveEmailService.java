package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.EmployeeManager;

import java.time.LocalDate;
import java.util.List;

public interface LeaveEmailService {

	void sendApplyLeaveRequestEmployeeEmail(String firstName, String lastName, String userEmail, String leaveTypeName,
			LocalDate startDate, LocalDate endDate, String leaveState, String comment, boolean isSingleDay);

	void sendReceivedLeaveRequestManagerEmail(List<EmployeeManager> managers, String firstName, String lastName,
			String leaveState, String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay);

	void sendCancelLeaveRequestEmployeeEmail(String userEmail, String firstName, String lastName, String leaveState,
			String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay);

	void sendCancelLeaveRequestManagerEmail(List<EmployeeManager> managers, String firstName, String lastName,
			String leaveState, String leaveTypeName, LocalDate startDate, LocalDate endDate, boolean isSingleDay);

	void sendApprovedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendApprovedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendApprovedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendApprovedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendRevokedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendRevokedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendRevokedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendRevokedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendDeclinedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendDeclinedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendDeclinedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendDeclinedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendNudgeSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendNudgeMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendAutoApprovedSingleDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendAutoApprovedMultiDayLeaveRequestEmployeeEmail(LeaveRequest leaveRequest);

	void sendAutoApprovedSingleDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendAutoApprovedMultiDayLeaveRequestManagerEmail(LeaveRequest leaveRequest);

	void sendCustomAllocationEmployeeEmail(LeaveEntitlement leaveEntitlement);

}
