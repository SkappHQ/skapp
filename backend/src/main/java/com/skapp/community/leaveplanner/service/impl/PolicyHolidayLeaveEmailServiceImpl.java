package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveEmailService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PolicyHolidayLeaveEmailServiceImpl implements PolicyHolidayLeaveEmailService {

	private final EmailService emailService;

	private final EmployeeManagerDao employeeManagerDao;

	private final OrganizationDao organizationDao;

	@Override
	public void sendHolidayLeaveRequestVoidedEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			LeaveRequestStatus originalStatus) {
		boolean wasPending = originalStatus == LeaveRequestStatus.PENDING;

		sendEmployeeEmail(policyLeaveRequest, buildDynamicFields(policyLeaveRequest, holiday),
				wasPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_EMPLOYEE
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_EMPLOYEE);

		sendManagerEmails(policyLeaveRequest, buildDynamicFields(policyLeaveRequest, holiday), wasPending
				? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_SINGLE_DAY_PENDING_LEAVE_REQUEST_CANCELED_MANAGER
				: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_SINGLE_DAY_APPROVED_LEAVE_REQUEST_REVOKED_MANAGER);
	}

	@Override
	public void sendHolidayLeaveRequestUpdatedEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday) {
		boolean isPending = policyLeaveRequest.getStatus() == LeaveRequestStatus.PENDING;

		sendEmployeeEmail(policyLeaveRequest, buildDynamicFields(policyLeaveRequest, holiday),
				isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_EMPLOYEE
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_EMPLOYEE);

		sendManagerEmails(policyLeaveRequest, buildDynamicFields(policyLeaveRequest, holiday),
				isPending ? EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_DAY_MULTI_DAY_PENDING_LEAVE_REQUEST_UPDATED_MANAGER
						: EmailBodyTemplates.PEOPLE_MODULE_HOLIDAY_MULTI_DAY_APPROVED_LEAVE_REQUEST_UPDATED_MANAGER);
	}

	private PeopleEmailDynamicFields buildDynamicFields(PolicyLeaveRequest policyLeaveRequest, Holiday holiday) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(getOrganizationName());
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		emailDynamicFields.setRevisedDuration(policyLeaveRequest.getDurationDays().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());
		return emailDynamicFields;
	}

	private void sendEmployeeEmail(PolicyLeaveRequest policyLeaveRequest, PeopleEmailDynamicFields emailDynamicFields,
			EmailBodyTemplates emailBodyTemplate) {
		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailService.sendEmail(emailBodyTemplate, emailDynamicFields,
				policyLeaveRequest.getEmployee().getUser().getEmail());
	}

	private void sendManagerEmails(PolicyLeaveRequest policyLeaveRequest, PeopleEmailDynamicFields emailDynamicFields,
			EmailBodyTemplates emailBodyTemplate) {
		PeopleUtil.filterManagersByLeaveRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> {
				emailDynamicFields.setEmployeeOrManagerName(manager.getManager().getFullName());
				emailService.sendEmail(emailBodyTemplate, emailDynamicFields,
						manager.getManager().getUser().getEmail());
			});
	}

	private String getOrganizationName() {
		return organizationDao.findTopByOrderByOrganizationIdDesc().map(Organization::getOrganizationName).orElse("");
	}

}
