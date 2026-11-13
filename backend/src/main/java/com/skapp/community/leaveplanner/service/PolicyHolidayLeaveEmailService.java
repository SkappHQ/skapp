package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.peopleplanner.model.Holiday;

public interface PolicyHolidayLeaveEmailService {

	void sendHolidayLeaveRequestEmails(PolicyLeaveRequest policyLeaveRequest, Holiday holiday,
			EmailBodyTemplates employeeTemplate, EmailBodyTemplates managerTemplate, String organizationName);

}
