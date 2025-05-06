package com.skapp.enterprise.common.service;

public interface DashboardEmailService {

	void sendNewOrganizationCreatedEmail(String companyName, String tenantId, String superAdminEmail, String contactNo);

	void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String tenantId, String superAdminEmail);

	void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail);

	void sendOrganizationCancelledSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail);

}
