package com.skapp.enterprise.common.service;

import com.stripe.model.Invoice;

public interface StripeEmailService {

	void sendTrialEndSoonEmail(String userEmail, String trialEndDate);

	void sendStripePaymentFailEmail(Invoice invoice);

	void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate);

	void SendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate);

}
