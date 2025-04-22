package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.email.DashboardEmailDynamicFields;
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
				EpEmailBodyTemplates.PAYMENT_STRIPE_WELCOME_TO_SKAPP_CORE_FREE_TRIAL, paymentEmailStripeDynamicFields,
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

	@Override
	public void sendNewOrganizationSignedUpforSkappFreeTierEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setSignedUpDateTime(signedUpDateTime);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_SIGN_UP_FREE_TIER, dashboardEmailDynamicFields,
				userEmail);
	}

	@Override
	public void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail, String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setSignedUpDateTime(signedUpDateTime);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail);
		dashboardEmailDynamicFields.setContactNumber(contactNumber);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_STARTED_CORE_FREE_TRIAL,
				dashboardEmailDynamicFields, userEmail);
	}

	@Override
	public void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String userEmail, String companyName,
			String tenantId, String subscriptionStartDate, long userCount, String superAdminEmail,
			String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setSubscriptionStartDate(subscriptionStartDate);
		dashboardEmailDynamicFields.setUserCount(userCount);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail);
		dashboardEmailDynamicFields.setContactNumber(contactNumber);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_TRIAL_ORGANIZATION_CONVERTED_TO_CORE, dashboardEmailDynamicFields,
				userEmail);
	}

	@Override
	public void sendFreeTierUserUpgradedToSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String upgradeDateTime, long userCount, String superAdminEmail, String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setUpgradeDateTime(upgradeDateTime);
		dashboardEmailDynamicFields.setUserCount(userCount);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail);
		dashboardEmailDynamicFields.setContactNumber(contactNumber);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_FREE_TIER_ORGANIZATION_UPGRADED_TO_CORE_TRIAL,
				dashboardEmailDynamicFields, userEmail);
	}

	@Override
	public void sendOrganizationCancelledSkappCoreSubscriptionEmail(String userEmail, String companyName,
			String tenantId, String cancellationDateTime, long userCount, String superAdminEmail,
			String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setCancellationDateTime(cancellationDateTime);
		dashboardEmailDynamicFields.setUserCount(userCount);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail);
		dashboardEmailDynamicFields.setContactNumber(contactNumber);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_ORGANIZATION_CANCELLED_CORE, dashboardEmailDynamicFields,
				userEmail);
	}

}
