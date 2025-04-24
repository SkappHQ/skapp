package com.skapp.enterprise.common.service;

public interface DashboardEmailService {

	void sendNewOrganizationCreatedEmail(String userEmail, String companyName, String tenantId, String signedUpDateTime,
			String superAdminEmail);

	void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail, String contactNumber);

	void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String userEmail, String companyName,
			String tenantId, String subscriptionStartDate, long userCount, String superAdminEmail,
			String contactNumber);

	void sendOrganizationCancelledSkappCoreSubscriptionEmail(String userEmail, String companyName, String tenantId,
			String cancellationDateTime, long userCount, String superAdminEmail, String contactNumber);

}
