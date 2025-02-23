package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.enterprise.common.payload.email.PaymentEmailStripeDynamicFields;
import com.skapp.enterprise.common.service.StripeEmailService;
import com.stripe.model.Invoice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeEmailServiceImpl implements StripeEmailService {

	private final EmailService emailService;

	private final OrganizationDao organizationDao;

	@Override
	public void sendTrialEndSoonEmail(String userEmail, String trialEndDate) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setOrganizationName(getOrganizationName());
		paymentEmailStripeDynamicFields.setTrialEndDate(trialEndDate);

		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_FREE_TRIAL_EXPIRES_IN_3DAYS,
				paymentEmailStripeDynamicFields, userEmail);

	}

	@Override
	public void sendStripePaymentFailEmailCountOne(Invoice invoice) {

		String userEmail = invoice.getCustomerEmail();

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setOrganizationName(getOrganizationName());

		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_TRIAL_END_DATE,
				paymentEmailStripeDynamicFields, userEmail);

		log.info("send payment fail eMail end of trial" + userEmail);

	}

	@Override
	public void sendStripePaymentFailEmailCountTwo(Invoice invoice) {

		String userEmail = invoice.getCustomerEmail();
		String retriedDate = DateTimeUtils.epochMillisToUtcLocalDate(invoice.getCreated()).toString();

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setRetriedDate(retriedDate);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_3DAYS_AND_5DAYS,
				paymentEmailStripeDynamicFields, userEmail);

		log.info("send payment fail eMail 3 days" + userEmail);
	}

	@Override
	public void sendStripePaymentFailEmailCountThree(Invoice invoice) {
		String userEmail = invoice.getCustomerEmail();
		String retriedDate = DateTimeUtils.epochMillisToUtcLocalDate(invoice.getCreated()).toString();

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setRetriedDate(retriedDate);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_3DAYS_AND_5DAYS,
				paymentEmailStripeDynamicFields, userEmail);

		log.info("send payment fail eMail 5 days" + userEmail);
	}

	@Override
	public void sendStripePaymentFailEmailCountFour(Invoice invoice) {
		String userEmail = invoice.getCustomerEmail();
		String moveToFreeDate = DateTimeUtils.epochMillisToUtcLocalDate(invoice.getCreated()).toString();

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setMoveToFreeDate(moveToFreeDate);
		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_7DAYS,
				paymentEmailStripeDynamicFields, userEmail);

		log.info("send payment fail eMail 7 days" + userEmail);
	}

	@Override
	public void sendWelcomeToSkappProFreeTrialEmail(String userEmail, String trialEndDate) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setOrganizationName(getOrganizationName());
		paymentEmailStripeDynamicFields.setTrialEndDate(trialEndDate);

		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_WELCOME_TO_SKAPP_PRO_FREE_TRIAL,
				paymentEmailStripeDynamicFields, userEmail);

	}

	@Override
	public void SendCongratulationsOnUpgradingToSkappProMail(String userEmail, String billingDate) {

		PaymentEmailStripeDynamicFields paymentEmailStripeDynamicFields = new PaymentEmailStripeDynamicFields();
		paymentEmailStripeDynamicFields.setOrganizationName(getOrganizationName());
		paymentEmailStripeDynamicFields.setBillingDate(billingDate);

		emailService.sendEmail(EmailBodyTemplates.PAYMENT_STRIPE_CONGRATULATIONS_ON_UPGRADING_TO_SKAPP_PRO,
				paymentEmailStripeDynamicFields, userEmail);

	}

	private String getOrganizationName() {
		Optional<Organization> optionalOrganization = organizationDao.findTopByOrderByOrganizationIdDesc();
		if (optionalOrganization.isEmpty()) {
			return "";
		}
		return optionalOrganization.get().getOrganizationName();
	}

}
