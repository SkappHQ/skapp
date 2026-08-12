package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.payload.email.LeaveEmailDynamicFields;
import com.skapp.community.leaveplanner.service.PolicyLeaveReviewNotificationService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Supplier;

/**
 * Emails and in-app notifications for the policy leave review transitions. The legacy
 * counterparts in {@code LeaveEmailServiceImpl} / {@code LeaveNotificationServiceImpl}
 * only accept a legacy {@code LeaveRequest}, so the policy flow dispatches through the
 * shared low level {@link EmailService} / {@link NotificationService} instead of widening
 * those interfaces. Templates and dynamic fields are the same ones the legacy flow uses.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyLeaveReviewNotificationServiceImpl implements PolicyLeaveReviewNotificationService {

	private final EmailService emailService;

	private final NotificationService notificationService;

	private final EmployeeManagerDao employeeManagerDao;

	@Override
	public void sendApprovedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest) {
		log.info("sendApprovedPolicyLeaveRequestNotifications: execution started");

		boolean isSingleDay = isSingleDay(leaveRequest);
		notifyEmployee(leaveRequest, isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_APPROVED_MULTI_DAY_LEAVE);
		notifyOtherManagers(leaveRequest,
				isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_SINGLE_DAY_LEAVE
						: EmailBodyTemplates.LEAVE_MODULE_MANAGER_APPROVED_MULTI_DAY_LEAVE);

		log.info("sendApprovedPolicyLeaveRequestNotifications: execution ended");
	}

	@Override
	public void sendDeclinedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest) {
		log.info("sendDeclinedPolicyLeaveRequestNotifications: execution started");

		boolean isSingleDay = isSingleDay(leaveRequest);
		notifyEmployee(leaveRequest, isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_DECLINED_MULTI_DAY_LEAVE);
		notifyOtherManagers(leaveRequest,
				isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_SINGLE_DAY_LEAVE
						: EmailBodyTemplates.LEAVE_MODULE_MANAGER_DECLINED_MULTI_DAY_LEAVE);

		log.info("sendDeclinedPolicyLeaveRequestNotifications: execution ended");
	}

	@Override
	public void sendRevokedPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest) {
		log.info("sendRevokedPolicyLeaveRequestNotifications: execution started");

		boolean isSingleDay = isSingleDay(leaveRequest);
		notifyEmployee(leaveRequest, isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_REVOKED_MULTI_DAY_LEAVE);
		notifyOtherManagers(leaveRequest, isSingleDay ? EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_MANAGER_REVOKED_MULTI_DAY_LEAVE);

		log.info("sendRevokedPolicyLeaveRequestNotifications: execution ended");
	}

	@Override
	public void sendCancelledPolicyLeaveRequestNotifications(PolicyLeaveRequest leaveRequest) {
		log.info("sendCancelledPolicyLeaveRequestNotifications: execution started");

		boolean isSingleDay = isSingleDay(leaveRequest);
		Employee employee = leaveRequest.getEmployee();

		LeaveEmailDynamicFields employeeFields = baseFields(leaveRequest);
		employeeFields.setEmployeeOrManagerName(fullName(employee));
		EmailBodyTemplates employeeTemplate = isSingleDay
				? EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_EMPLOYEE_CANCEL_MULTIPLE_DAY_LEAVE;

		emailService.sendEmail(employeeTemplate, employeeFields, employee.getUser().getEmail());
		notificationService.createNotification(employee, resourceId(leaveRequest), NotificationType.LEAVE_REQUEST,
				employeeTemplate, employeeFields, NotificationCategory.LEAVE);

		EmailBodyTemplates managerTemplate = isSingleDay
				? EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_MANAGER_CANCEL_MULTIPLE_DAY_LEAVE;

		dispatchToManagers(employeeManagerDao.findByEmployee(employee), leaveRequest, () -> {
			LeaveEmailDynamicFields managerFields = baseFields(leaveRequest);
			managerFields.setEmployeeName(fullName(employee));
			managerFields.setEmployeesName(fullName(employee));
			return managerFields;
		}, managerTemplate);

		log.info("sendCancelledPolicyLeaveRequestNotifications: execution ended");
	}

	private void notifyEmployee(PolicyLeaveRequest leaveRequest, EmailBodyTemplates template) {
		Employee employee = leaveRequest.getEmployee();
		LeaveEmailDynamicFields fields = baseFields(leaveRequest);
		fields.setEmployeeOrManagerName(fullName(employee));
		fields.setComment(leaveRequest.getReviewerComment());
		if (leaveRequest.getReviewer() != null) {
			fields.setManagerName(fullName(leaveRequest.getReviewer()));
		}

		emailService.sendEmail(template, fields, employee.getUser().getEmail());
		notificationService.createNotification(employee, resourceId(leaveRequest), NotificationType.LEAVE_REQUEST,
				template, fields, NotificationCategory.LEAVE);
	}

	/**
	 * Nudges every leave manager of the requester, matching the legacy
	 * {@code sendNudge*DayLeaveRequestManagerEmail} / {@code ...Notification} pair. The
	 * notification is written under {@link NotificationType#LEAVE_REQUEST_NUDGE} because
	 * the throttle in the review service reads back the latest one of that type.
	 */
	@Override
	public void sendNudgePolicyLeaveRequestManagerNotifications(PolicyLeaveRequest leaveRequest) {
		log.info("sendNudgePolicyLeaveRequestManagerNotifications: execution started");

		Employee employee = leaveRequest.getEmployee();

		EmailBodyTemplates template = isSingleDay(leaveRequest)
				? EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_SINGLE_DAY_LEAVE
				: EmailBodyTemplates.LEAVE_MODULE_MANAGER_NUDGE_MULTI_DAY_LEAVE;

		dispatchToManagers(employeeManagerDao.findByEmployee(employee), leaveRequest, () -> {
			LeaveEmailDynamicFields fields = baseFields(leaveRequest);
			fields.setEmployeeName(fullName(employee));
			fields.setEmployeesName(fullName(employee));
			fields.setComment(leaveRequest.getReviewerComment());
			return fields;
		}, template, NotificationType.LEAVE_REQUEST_NUDGE);

		log.info("sendNudgePolicyLeaveRequestManagerNotifications: execution ended");
	}

	private void notifyOtherManagers(PolicyLeaveRequest leaveRequest, EmailBodyTemplates template) {
		Employee employee = leaveRequest.getEmployee();
		Employee reviewer = leaveRequest.getReviewer();

		List<EmployeeManager> otherManagers = employeeManagerDao.findByEmployee(employee)
			.stream()
			.filter(employeeManager -> reviewer == null
					|| !employeeManager.getManager().getEmployeeId().equals(reviewer.getEmployeeId()))
			.toList();

		dispatchToManagers(otherManagers, leaveRequest, () -> {
			LeaveEmailDynamicFields fields = baseFields(leaveRequest);
			fields.setEmployeeName(fullName(employee));
			fields.setComment(leaveRequest.getReviewerComment());
			if (reviewer != null) {
				fields.setManagerName(fullName(reviewer));
			}
			return fields;
		}, template);
	}

	private void dispatchToManagers(List<EmployeeManager> managers, PolicyLeaveRequest leaveRequest,
			Supplier<LeaveEmailDynamicFields> fieldsSupplier, EmailBodyTemplates template) {
		dispatchToManagers(managers, leaveRequest, fieldsSupplier, template, NotificationType.LEAVE_REQUEST);
	}

	/**
	 * The dynamic fields are rebuilt per recipient rather than mutated in place: the name
	 * is recipient specific, so a shared instance would leak whichever name was set last
	 * the moment the email or notification dispatch stops being synchronous.
	 */
	private void dispatchToManagers(List<EmployeeManager> managers, PolicyLeaveRequest leaveRequest,
			Supplier<LeaveEmailDynamicFields> fieldsSupplier, EmailBodyTemplates template,
			NotificationType notificationType) {
		PeopleUtil.filterManagersByLeaveRoles(managers).forEach(employeeManager -> {
			Employee manager = employeeManager.getManager();
			LeaveEmailDynamicFields fields = fieldsSupplier.get();
			fields.setEmployeeOrManagerName(fullName(manager));
			emailService.sendEmail(template, fields, manager.getUser().getEmail());
			notificationService.createNotification(manager, resourceId(leaveRequest), notificationType, template,
					fields, NotificationCategory.LEAVE);
		});
	}

	private LeaveEmailDynamicFields baseFields(PolicyLeaveRequest leaveRequest) {
		LeaveEmailDynamicFields fields = new LeaveEmailDynamicFields();
		fields.setLeaveDuration(String.valueOf(leaveRequest.getLeaveState()));
		fields.setLeaveType(leaveRequest.getPolicy().getLeaveType().getName());
		fields.setLeaveStartDate(leaveRequest.getStartDate().toString());
		fields.setLeaveEndDate(leaveRequest.getEndDate().toString());
		return fields;
	}

	private boolean isSingleDay(PolicyLeaveRequest leaveRequest) {
		return leaveRequest.getStartDate().equals(leaveRequest.getEndDate());
	}

	private String resourceId(PolicyLeaveRequest leaveRequest) {
		return leaveRequest.getId().toString();
	}

	private String fullName(Employee employee) {
		return employee.getFirstName() + " " + employee.getLastName();
	}

}
