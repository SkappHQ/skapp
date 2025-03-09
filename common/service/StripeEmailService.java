package com.skapp.enterprise.common.service;

public interface StripeEmailService {

	void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate, String tenantName);

	void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName);

	void sendCancelSubscriptionEmail(String userEmail, String endDate, String tenantName);
}
