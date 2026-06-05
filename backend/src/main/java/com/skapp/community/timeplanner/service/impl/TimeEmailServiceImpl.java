package com.skapp.community.timeplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.payload.email.AttendanceEmailDynamicFields;
import com.skapp.community.timeplanner.service.TimeEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeEmailServiceImpl implements TimeEmailService {

	private final EmailService emailService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		emailService.sendEmail(
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());

	}

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeEmail(LeaveRequest leaveRequest,
			List<TimeConfig> timeConfigs) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		String nonWorkingDays = timeConfigs.stream()
			.map(config -> config.getDay().toString())
			.collect(Collectors.joining(", "));

		emailDynamicFields.setNonWorkingDates(nonWorkingDays);

		emailService.sendEmail(
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerEmail(LeaveRequest leaveRequest,
			List<TimeConfig> timeConfigs) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		String nonWorkingDays = timeConfigs.stream()
			.map(config -> config.getDay().toString())
			.collect(Collectors.joining(", "));

		emailDynamicFields.setNonWorkingDates(nonWorkingDays);

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());

		emailService.sendEmail(
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());

	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);

	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());
		emailDynamicFields.setLeaveType(leaveRequest.getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());

		emailService.sendEmail(
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE,
				emailDynamicFields, leaveRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerEmail(LeaveRequest leaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		emailDynamicFields.setEmployeeName(
				leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName());

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(leaveRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestSubmittedEmployeeEmail(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));

		User user = timeRequest.getEmployee().getUser();

		emailService.sendEmail(EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_SUBMITTED_EMPLOYEE,
				emailDynamicFields, user.getEmail());
	}

	@Override
	public void sendReceivedTimeEntryRequestManagerEmail(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(timeRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_RECEIVED_TIME_ENTRY_REQUEST_MANAGER);

	}

	@Override
	public void sendTimeEntryRequestApprovedEmployeeEmail(TimeRequest timeRequestResponse, User managerUser) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(timeRequestResponse.getEmployee().getFirstName() + " "
				+ timeRequestResponse.getEmployee().getLastName());
		emailDynamicFields.setTimeEntryDate(
				DateTimeUtils.epochMillisToUtcLocalDate(timeRequestResponse.getRequestedStartTime()).toString());
		emailDynamicFields
			.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedEndTime()));
		emailDynamicFields
			.setManagerName(managerUser.getEmployee().getFirstName() + " " + managerUser.getEmployee().getLastName());

		emailService.sendEmail(EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_EMPLOYEE,
				emailDynamicFields, timeRequestResponse.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendTimeEntryRequestDeclinedEmployeeEmail(TimeRequest timeRequestResponse, User managerUser) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(timeRequestResponse.getEmployee().getFirstName() + " "
				+ timeRequestResponse.getEmployee().getLastName());
		emailDynamicFields.setTimeEntryDate(
				DateTimeUtils.epochMillisToUtcLocalDate(timeRequestResponse.getRequestedStartTime()).toString());
		emailDynamicFields
			.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedEndTime()));
		emailDynamicFields
			.setManagerName(managerUser.getEmployee().getFirstName() + " " + managerUser.getEmployee().getLastName());

		emailService.sendEmail(EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_EMPLOYEE,
				emailDynamicFields, timeRequestResponse.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendPendingTimeEntryRequestCancelledEmployeeEmail(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));

		emailService.sendEmail(EmailBodyTemplates.ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_EMPLOYEE,
				emailDynamicFields, timeRequest.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendPendingTimeEntryRequestCancelledManagerEmail(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(timeRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_PENDING_TIME_ENTRY_REQUEST_CANCELLED_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestAutoApprovedEmployeeEmail(TimeRequest timeRequestResponse) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(timeRequestResponse.getEmployee().getFirstName() + " "
				+ timeRequestResponse.getEmployee().getLastName());
		emailDynamicFields.setTimeEntryDate(
				DateTimeUtils.epochMillisToUtcLocalDate(timeRequestResponse.getRequestedStartTime()).toString());
		emailDynamicFields
			.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequestResponse.getRequestedEndTime()));

		emailService.sendEmail(EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_EMPLOYEE,
				emailDynamicFields, timeRequestResponse.getEmployee().getUser().getEmail());
	}

	@Override
	public void sendTimeEntryRequestAutoApprovedManagerEmail(TimeRequest timeRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));

		List<EmployeeManager> managers = employeeManagerDao.findByEmployee(timeRequest.getEmployee());

		createAttendanceEmailForManagers(managers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_AUTO_APPROVED_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestApprovedOtherManagerEmail(TimeRequest timeRequest, User managerUser) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));
		emailDynamicFields
			.setManagerName(managerUser.getEmployee().getFirstName() + " " + managerUser.getEmployee().getLastName());
		emailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(timeRequest.getEmployee()), managerUser);

		createAttendanceEmailForManagers(otherManagers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_APPROVED_OTHER_MANAGER);
	}

	@Override
	public void sendTimeEntryRequestDeclinedOtherManagerEmail(TimeRequest timeRequest, User managerUser) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();

		emailDynamicFields.setEmployeeOrManagerName(
				managerUser.getEmployee().getFirstName() + " " + managerUser.getEmployee().getLastName());
		emailDynamicFields
			.setEmployeeName(timeRequest.getEmployee().getFirstName() + " " + timeRequest.getEmployee().getLastName());
		emailDynamicFields
			.setTimeEntryDate(DateTimeUtils.epochMillisToUtcLocalDate(timeRequest.getRequestedStartTime()).toString());
		emailDynamicFields.setStartTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedStartTime()));
		emailDynamicFields.setEndTime(DateTimeUtils.epochMillisToAmPmString(timeRequest.getRequestedEndTime()));
		emailDynamicFields
			.setManagerName(managerUser.getEmployee().getFirstName() + " " + managerUser.getEmployee().getLastName());

		List<EmployeeManager> otherManagers = getOtherManagers(
				employeeManagerDao.findByEmployee(timeRequest.getEmployee()), managerUser);

		createAttendanceEmailForManagers(otherManagers, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_TIME_ENTRY_REQUEST_DECLINED_OTHER_MANAGER);
	}

	private List<EmployeeManager> getOtherManagers(List<EmployeeManager> allManagers, User currentManager) {
		return allManagers.stream()
			.filter(manager -> !manager.getManager().getUser().getUserId().equals(currentManager.getUserId()))
			.toList();
	}

	private void createAttendanceEmailForManagers(List<EmployeeManager> managers,
			AttendanceEmailDynamicFields attendanceEmailDynamicFields, EmailBodyTemplates emailBodyTemplates) {
		PeopleUtil.filterManagersByAttendanceRoles(managers).forEach(manager -> {
			attendanceEmailDynamicFields.setEmployeeOrManagerName(
					manager.getManager().getFirstName() + " " + manager.getManager().getLastName());
			emailService.sendEmail(emailBodyTemplates, attendanceEmailDynamicFields,
					manager.getManager().getUser().getEmail());
		});
	}

}
