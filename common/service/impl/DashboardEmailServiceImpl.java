package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.enterprise.common.payload.email.DashboardEmailDynamicFields;
import com.skapp.enterprise.common.service.DashboardEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardEmailServiceImpl implements DashboardEmailService {

	private final EmailService emailService;

	@Override
	public void sendNewOrganizationCreatedEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail, String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setSignedUpDateTime(signedUpDateTime);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		dashboardEmailDynamicFields.setContactNumber(contactNumber != null ? contactNumber : "");

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_CREATED, dashboardEmailDynamicFields, userEmail);
	}

	@Override
	public void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String userEmail, String companyName, String tenantId,
			String signedUpDateTime, String superAdminEmail, String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setSignedUpDateTime(signedUpDateTime);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		dashboardEmailDynamicFields.setContactNumber(contactNumber != null ? contactNumber : "");

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
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		dashboardEmailDynamicFields.setContactNumber(contactNumber != null ? contactNumber : "");

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_TRIAL_ORGANIZATION_CONVERTED_TO_CORE, dashboardEmailDynamicFields,
				userEmail);
	}

	@Override
	public void sendOrganizationCancelledSkappCoreSubscriptionEmail(String userEmail, String companyName,
			String tenantId, String cancellationDateTime, long userCount, String superAdminEmail,
			String contactNumber) {

		DashboardEmailDynamicFields dashboardEmailDynamicFields = new DashboardEmailDynamicFields();
		dashboardEmailDynamicFields.setCompanyName(companyName);
		dashboardEmailDynamicFields.setTenantId(tenantId);
		dashboardEmailDynamicFields.setCancelledDateTime(cancellationDateTime);
		dashboardEmailDynamicFields.setUserCount(userCount);
		dashboardEmailDynamicFields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		dashboardEmailDynamicFields.setContactNumber(contactNumber != null ? contactNumber : "");

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_ORGANIZATION_CANCELLED_CORE, dashboardEmailDynamicFields,
				userEmail);
	}

}
