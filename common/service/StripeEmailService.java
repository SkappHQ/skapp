package com.skapp.enterprise.common.service;

public interface StripeEmailService {

	void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate, String tenantName);

	void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName);

	void sendCancelSubscriptionEmail(String userEmail, String endDate, String tenantName);

	void sendNewOrganizationSignedUpforSkappFreeTierEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail);

	void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail, String contactNumber);

	void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String userEmail, String companyName,
			String tenantId, String subscriptionStartDate, long userCount, String superAdminEmail,
			String contactNumber);

	void sendFreeTierUserUpgradedToSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String upgradeDateTime, long userCount, String superAdminEmail, String contactNumber);

	void sendOrganizationCancelledSkappCoreSubscriptionEmail(String userEmail, String companyName, String tenantId,
			String cancellationDateTime, long userCount, String superAdminEmail, String contactNumber);

}
