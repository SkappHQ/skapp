package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.type.Tier;

public interface StripeEmailService {

	void sendWelcomeToSkappFreeTrialEmail(String userEmail, String trialEndDate, String tenantName, Tier tier);

	void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName);

	void sendCancelSubscriptionEmail(String userEmail, String endDate, String tenantName);

}
