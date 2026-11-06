package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyAttendanceLeaveEmailService;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.payload.email.AttendanceEmailDynamicFields;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyAttendanceLeaveEmailServiceImpl implements PolicyAttendanceLeaveEmailService {

	private final EmailService emailService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelEmployeeEmail(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());

		sendEmployeeEmail(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDaySingleDayPendingLeaveRequestCancelManagerEmail(PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());

		sendManagerEmails(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelEmployeeEmail(PolicyLeaveRequest policyLeaveRequest,
			List<TimeConfig> removingConfigs) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		emailDynamicFields.setNonWorkingDates(getNonWorkingDays(removingConfigs));

		sendEmployeeEmail(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDayMultiDayPendingLeaveRequestCancelManagerEmail(PolicyLeaveRequest policyLeaveRequest,
			List<TimeConfig> removingConfigs) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setNonWorkingDates(getNonWorkingDays(removingConfigs));

		sendManagerEmails(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedEmployeeEmail(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());

		sendEmployeeEmail(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDaySingleDayApprovedLeaveRequestRevokedManagerEmail(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());

		sendManagerEmails(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedEmployeeEmail(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());

		sendEmployeeEmail(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);
	}

	@Override
	public void sendNonWorkingDayMultiDayApprovedLeaveRequestRevokedManagerEmail(
			PolicyLeaveRequest policyLeaveRequest) {
		AttendanceEmailDynamicFields emailDynamicFields = new AttendanceEmailDynamicFields();
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());

		sendManagerEmails(policyLeaveRequest, emailDynamicFields,
				EmailBodyTemplates.ATTENDANCE_MODULE_NON_WORKING_DAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	private void sendEmployeeEmail(PolicyLeaveRequest policyLeaveRequest,
			AttendanceEmailDynamicFields emailDynamicFields, EmailBodyTemplates emailBodyTemplate) {
		emailService.sendEmail(emailBodyTemplate, emailDynamicFields,
				policyLeaveRequest.getEmployee().getUser().getEmail());
	}

	private void sendManagerEmails(PolicyLeaveRequest policyLeaveRequest,
			AttendanceEmailDynamicFields emailDynamicFields, EmailBodyTemplates emailBodyTemplate) {
		PeopleUtil.filterManagersByAttendanceRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> {
				emailDynamicFields.setEmployeeOrManagerName(manager.getManager().getFullName());
				emailService.sendEmail(emailBodyTemplate, emailDynamicFields,
						manager.getManager().getUser().getEmail());
			});
	}

	private String getNonWorkingDays(List<TimeConfig> removingConfigs) {
		return removingConfigs.stream().map(config -> config.getDay().toString()).collect(Collectors.joining(", "));
	}

}
