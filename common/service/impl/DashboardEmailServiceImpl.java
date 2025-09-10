package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.component.ProfileActivator;
import com.skapp.community.common.service.EmailService;
import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;
import com.skapp.enterprise.common.payload.email.DashboardEmailDynamicFields;
import com.skapp.enterprise.common.service.DashboardEmailService;
import com.skapp.enterprise.common.service.DashboardService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.common.type.SupportRequestIssueType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardEmailServiceImpl implements DashboardEmailService {

	private final EmailService emailService;

	private final DashboardService dashboardService;

	private final ProfileActivator profileActivator;

	@Value("${organization.email}")
	private String organizationEmail;

	@Override
	public void sendNewOrganizationCreatedEmail(String tenantId, String superAdminEmail) {
		sendDashboardEmail(EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_CREATED, tenantId, superAdminEmail);
	}

	@Override
	public void sendNewOrganizationStartedSkappCoreFreeTrialEmail(String tenantId, String superAdminEmail) {
		sendDashboardEmail(EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_STARTED_CORE_FREE_TRIAL, tenantId,
				superAdminEmail);
	}

	@Override
	public void sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail) {
		sendDashboardEmail(EpEmailBodyTemplates.DASHBOARD_MODULE_TRIAL_ORGANIZATION_CONVERTED_TO_CORE, tenantId,
				superAdminEmail);
	}

	@Override
	public void sendOrganizationCancelledSkappCoreSubscriptionEmail(String tenantId, String superAdminEmail) {
		sendDashboardEmail(EpEmailBodyTemplates.DASHBOARD_MODULE_ORGANIZATION_CANCELLED_CORE, tenantId,
				superAdminEmail);
	}

	@Override
	public void sendSupportRequestAppliedEmail(String tenantId, String superAdminEmail,
			SupportRequestIssueType issueType, String details, int noOfAttachments) {
		DashboardEmailOrganizationDetailsDto dashboardEmailOrganizationDetails = dashboardService
			.getDashboardEmailOrganizationDetails(superAdminEmail);

		DashboardEmailDynamicFields fields = new DashboardEmailDynamicFields();
		fields.setSuperAdminName(dashboardEmailOrganizationDetails.getSuperAdminName());
		fields.setCompanyName(dashboardEmailOrganizationDetails.getCompanyName());
		fields.setIssueType(issueType.label);
		fields.setDetails(details);
		fields.setSubmittedDateTime(dashboardEmailOrganizationDetails.getCurrentTime());
		fields.setTenantId(tenantId);
		fields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		fields.setContactNumber(dashboardEmailOrganizationDetails.getContactNo() != null
				? dashboardEmailOrganizationDetails.getContactNo() : "");
		fields.setNoOfAttachments(noOfAttachments);

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.DASHBOARD_MODULE_SUPPORT_REQUEST_APPLIED, fields, organizationEmail);
	}

	private void sendDashboardEmail(EpEmailBodyTemplates template, String tenantId, String superAdminEmail) {
		if (!profileActivator.isEpPrdProfile()) {
			return;
		}

		DashboardEmailOrganizationDetailsDto details = dashboardService
			.getDashboardEmailOrganizationDetails(superAdminEmail);

		DashboardEmailDynamicFields fields = new DashboardEmailDynamicFields();
		fields.setCompanyName(details.getCompanyName());
		fields.setTenantId(tenantId);
		fields.setSuperAdminEmail(superAdminEmail != null ? superAdminEmail : "");
		fields.setSuperAdminName(details.getSuperAdminName());
		fields.setContactNumber(details.getContactNo() != null ? details.getContactNo() : "");
		if (details.getCurrentTime() != null) {
			fields.setSignedUpDateTime(details.getCurrentTime());
			fields.setSubscriptionStartDate(details.getCurrentTime());
			fields.setCancelledDateTime(details.getCurrentTime());
			fields.setUpgradedDateTime(details.getCurrentTime());
		}
		if (details.getUserCount() >= 1) {
			fields.setUserCount(details.getUserCount());
		}

		emailService.sendEmail(EpEmailMainTemplates.DASHBOARD_MAIN_TEMPLATE_V1, template, fields, organizationEmail);
	}

}
