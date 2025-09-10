package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.type.SupportRequestIssueType;

public interface DashboardEmailService {

	void sendNewOrganizationCreatedEmail(String tenantId, String superAdminEmail);

	void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String tenantId, String superAdminEmail);

	void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail);

	void sendOrganizationCancelledSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail);

	void sendSupportRequestAppliedEmail(String tenantId, String superAdminEmail, SupportRequestIssueType issueType,
			String details, int noOfAttachments);

}
