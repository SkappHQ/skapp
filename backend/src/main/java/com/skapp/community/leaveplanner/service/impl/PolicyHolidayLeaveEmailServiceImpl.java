package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.service.PolicyHolidayLeaveEmailService;
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

	@Override
	public void sendHolidayLeaveRequestEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			EmailBodyTemplates employeeTemplate, EmailBodyTemplates managerTemplate, String organizationName) {
		log.info("sendHolidayLeaveRequestEmails: execution started");

		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setOrganizationName(organizationName);
		emailDynamicFields.setEmployeeName(policyLeaveRequest.getEmployee().getFullName());
		emailDynamicFields.setLeaveType(policyLeaveRequest.getPolicy().getLeaveType().getName());
		emailDynamicFields.setLeaveDuration(String.valueOf(policyLeaveRequest.getLeaveState()));
		emailDynamicFields.setLeaveStartDate(policyLeaveRequest.getStartDate().toString());
		emailDynamicFields.setLeaveEndDate(policyLeaveRequest.getEndDate().toString());
		emailDynamicFields.setRevisedDuration(policyLeaveRequest.getDurationDays().toString());
		emailDynamicFields.setHolidayDate(holiday.getDate().toString());
		emailDynamicFields.setHolidayName(holiday.getName());

		emailDynamicFields.setEmployeeOrManagerName(policyLeaveRequest.getEmployee().getFullName());
		emailService.sendEmail(employeeTemplate, emailDynamicFields,
				policyLeaveRequest.getEmployee().getUser().getEmail());

		PeopleUtil.filterManagersByLeaveRoles(employeeManagerDao.findByEmployee(policyLeaveRequest.getEmployee()))
			.forEach(manager -> {
				emailDynamicFields.setEmployeeOrManagerName(manager.getManager().getFullName());
				emailService.sendEmail(managerTemplate, emailDynamicFields, manager.getManager().getUser().getEmail());
			});

		log.info("sendHolidayLeaveRequestEmails: execution ended");
	}

}
