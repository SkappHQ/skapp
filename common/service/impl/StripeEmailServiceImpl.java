package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.email.PaymentEmailStripeDynamicFields;
import com.skapp.enterprise.common.service.StripeEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeEmailServiceImpl implements StripeEmailService {

	private final EmailService emailService;

	private final TenantContext tenantContext;

	@Override
	public void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setTrialEndDate(trialEndDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_PAYMENT_V1,
				EpEmailBodyTemplates.PAYMENT_STRIPE_WELCOME_TO_SKAPP_PRO_FREE_TRIAL, paymentEmailStripeDynamicFields,
				userEmail);
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

	@Override
	public void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setBillingDate(billingDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);
		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_PAYMENT_V1,
				EpEmailBodyTemplates.PAYMENT_STRIPE_CONGRATULATIONS_ON_UPGRADING_TO_SKAPP_CORE,
				paymentEmailStripeDynamicFields, userEmail);

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

	@Override
	public void sendCancelSubscriptionEmail(String userEmail, String endDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setEndDate(endDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);
		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_PAYMENT_V1,
				EpEmailBodyTemplates.PAYMENT_STRIPE_CANCEL_SUBSCRIPTION, paymentEmailStripeDynamicFields, userEmail);

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
	}

}
