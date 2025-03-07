package com.skapp.enterprise.common.service;

import com.stripe.model.Invoice;

public interface StripeEmailService {

	void sendTrialEndSoonEmail(String userEmail, String trialEndDate, String tenantName);

	void sendStripePaymentFailEmail(Invoice invoice, String tenantName);

	void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate, String tenantName);

	void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName);

}
