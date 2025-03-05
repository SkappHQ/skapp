package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.email.PaymentEmailStripeDynamicFields;
import com.skapp.enterprise.common.service.StripeEmailService;
import com.stripe.model.Invoice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeEmailServiceImpl implements StripeEmailService {

	private final EmailService emailService;

	private final OrganizationDao organizationDao;

	private final TenantContext tenantContext;

	@Override
	public void sendTrialEndSoonEmail(String userEmail, String trialEndDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setTrialEndDate(trialEndDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_FREE_TRIAL_EXPIRES_IN_3DAYS,
				paymentEmailStripeDynamicFields, userEmail);
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

	@Override
	public void sendStripePaymentFailEmail(Invoice invoice, String tenantName) {

		String userEmail = invoice.getCustomerEmail();

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();

		int attemptCount = invoice.getAttemptCount().intValue();

		tenantContext.setTenantAndSwitchSchema(tenantName);
		switch (attemptCount) {
			case 1 -> {
				emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_TRIAL_END_DATE,
						paymentEmailStripeDynamicFields, userEmail);
				log.info("send payment fail eMail end of trial" + userEmail);
			}
			case 2 -> {
				paymentEmailStripeDynamicFields.setRetriedDate(DateTimeUtils.getCurrentUtcDate().toString());
				emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_3DAYS_AND_5DAYS,
						paymentEmailStripeDynamicFields, userEmail);

				log.info("send payment fail eMail 3 days" + userEmail);
			}
			case 3 -> {
				paymentEmailStripeDynamicFields.setRetriedDate(DateTimeUtils.getCurrentUtcDate().toString());
				emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_3DAYS_AND_5DAYS,
						paymentEmailStripeDynamicFields, userEmail);

				log.info("send payment fail eMail 5 days" + userEmail);
			}
			case 4 -> {
				paymentEmailStripeDynamicFields.setMoveToFreeDate(DateTimeUtils.getCurrentUtcDate().toString());
				emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_7DAYS,
						paymentEmailStripeDynamicFields, userEmail);

				log.info("send payment fail eMail 7 days" + userEmail);
			}
			default -> {
				emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_TRIAL_END_DATE,
						paymentEmailStripeDynamicFields, userEmail);
				log.info("send payment fail eMail end of trial defailt or if manulally triggered" + userEmail);
			}
		}
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

	@Override
	public void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setTrialEndDate(trialEndDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_WELCOME_TO_SKAPP_PRO_FREE_TRIAL,
				paymentEmailStripeDynamicFields, userEmail);
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

	@Override
	public void sendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate, String tenantName) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setBillingDate(billingDate);

		tenantContext.setTenantAndSwitchSchema(tenantName);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_CONGRATULATIONS_ON_UPGRADING_TO_SKAPP_PRO,
				paymentEmailStripeDynamicFields, userEmail);

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

	}

}
