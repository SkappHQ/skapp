package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.payload.email.EmailTemplateMetadata;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.service.impl.EmailServiceImpl;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.EmailTemplates;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.EpAsyncEmailSender;
import com.skapp.enterprise.common.service.EpEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@Primary
@Slf4j
public class EpEmailServiceImpl extends EmailServiceImpl implements EpEmailService {

	private static final String EMAIL_LANGUAGE = "en";

	private final OrganizationDao organizationDao;

	private final EpAsyncEmailSender epAsyncEmailSender;

	public EpEmailServiceImpl(AsyncEmailSender asyncEmailSender, OrganizationDao organizationDao,
			EpAsyncEmailSender epAsyncEmailSender) {
		super(asyncEmailSender);
		this.organizationDao = organizationDao;
		this.epAsyncEmailSender = epAsyncEmailSender;
	}

	@Override
	public void loadTemplateDetails() {
		if (templateDetailsMap == null) {
			templateDetailsMap = new HashMap<>();

			addTemplatesFromPath("community/templates/email/email-templates.yml");
			addTemplatesFromPath("enterprise/templates/email/email-templates.yml");
		}

	}

	@Override
	protected void getEnumTranslationsStream() {
		if (enumTranslationsMap == null) {
			enumTranslationsMap = new HashMap<>();

			loadEnumTranslationsFromPath("community/templates/common/enum-translations.yml");
			loadEnumTranslationsFromPath("enterprise/templates/common/enum-translations.yml");

			log.info("Enum translations loaded. Map size: {}", enumTranslationsMap.size());
			if (!enumTranslationsMap.isEmpty()) {
				log.info("Sample enum translations: {}", enumTranslationsMap);
			}
		}
	}

	@Override
	protected String buildTemplatePath(String module, String templateId) {
		return findExistingPath(
				String.format("community/templates/email/%s/%s/%s.html", EMAIL_LANGUAGE, module, templateId),
				String.format("enterprise/templates/email/%s/%s/%s.html", EMAIL_LANGUAGE, module, templateId));
	}

	@Override
	protected String buildMainTemplatePath(EmailTemplates emailMainTemplate) {
		return findExistingPath(
				String.format("community/templates/email/%s/%s.html", EMAIL_LANGUAGE,
						emailMainTemplate.getTemplateId()),
				String.format("enterprise/templates/email/%s/%s.html", EMAIL_LANGUAGE,
						emailMainTemplate.getTemplateId()));
	}

	@Override
	protected void setTemplatePlaceholderData(EmailTemplates emailTemplate, Map<String, String> placeholders,
			EmailTemplateMetadata templateDetails, String module) {
		super.setTemplatePlaceholderData(emailTemplate, placeholders, templateDetails, module);
		placeholders.put("module", module);
		if (emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_EMAIL_VERIFY
				&& emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_GOOGLE_SSO_CREATION_TENANT_URL
				&& emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_MICROSOFT_SSO_CREATION_TENANT_URL
				&& emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_CREDENTIAL_BASED_CREATION_TENANT_URL
				&& emailTemplate != EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_CREATED
				&& emailTemplate != EpEmailBodyTemplates.DASHBOARD_MODULE_NEW_ORGANIZATION_STARTED_CORE_FREE_TRIAL
				&& emailTemplate != EpEmailBodyTemplates.DASHBOARD_MODULE_TRIAL_ORGANIZATION_CONVERTED_TO_CORE
				&& emailTemplate != EpEmailBodyTemplates.DASHBOARD_MODULE_ORGANIZATION_CANCELLED_CORE) {
			Optional<Organization> organization = organizationDao.findTopByOrderByOrganizationIdDesc();
			organization.ifPresent(value -> {
				placeholders.put("appUrl", value.getAppUrl());
				placeholders.put("organizationName", value.getOrganizationName());
			});
		}

		if (emailTemplate == EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_V1
				|| emailTemplate == EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_GOOGLE_SSO
				|| emailTemplate == EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_MICROSOFT_SSO) {
			placeholders.put("tenantId", TenantContext.getCurrentTenant());
		}

		if (TenantContext.getCurrentTenant() != null
				&& !Objects.equals(TenantContext.getCurrentTenant(), EpCommonConstants.MASTER_DATABASE)) {
			placeholders.put("appUrl", "https://" + TenantContext.getCurrentTenant() + ".skapp.com/signin");
		}
	}

	@Override
	public String obtainSendGridBatchId() {
		return epAsyncEmailSender.getSendGridEmailBatchId();
	}

	@Override
	public void cancelScheduledEmail(String batchId, String status) {
		epAsyncEmailSender.cancelScheduledEmails(batchId, status);
	}

	@Override
	public void sendEmailWithAttachment(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate,
			Object dynamicFeildObject, String recipient, byte[] attachmentData, String attachmentName,
			String attachmentContentType, List<String> ccEmails) {

		processEmailDetailsWithAttachment(emailMainTemplate, emailTemplate, dynamicFeildObject, recipient,
				attachmentData, attachmentName, attachmentContentType, ccEmails);
	}

	private void processEmailDetailsWithAttachment(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate,
			Object dynamicFieldObject, String recipient, byte[] attachmentData, String attachmentName,
			String attachmentContentType, List<String> ccEmails) {

		try {
			if (emailTemplate == null || recipient == null) {
				log.error("Email template or recipient is null");
				return;
			}

			EmailTemplateMetadata templateDetails = getTemplateDetails(emailTemplate.getTemplateId());
			if (templateDetails == null) {
				log.error("Template not found for ID: {}", emailTemplate.getTemplateId());
				return;
			}

			String module = findModuleForTemplate(emailTemplate.getTemplateId());
			if (module == null) {
				log.error("Module not found for template ID: {}", emailTemplate.getTemplateId());
				return;
			}

			if (attachmentData == null) {
				throw new IllegalArgumentException("attachmentData must not be null");
			}
			if (attachmentName == null) {
				throw new IllegalArgumentException("attachmentName must not be null");
			}
			if (attachmentContentType == null) {
				throw new IllegalArgumentException("attachmentContentType must not be null");
			}

			Map<String, String> placeholders = convertDtoToMap(dynamicFieldObject);
			placeholders.replaceAll(this::getLocalizedEnumValue);

			setTemplatePlaceholderData(emailTemplate, placeholders, templateDetails, module);

			String emailBody = buildEmailBody(templateDetails, module, placeholders, emailMainTemplate);

			String subject = templateDetails.getSubject();

			java.lang.reflect.Method getSubjectMethod = dynamicFieldObject.getClass().getMethod("getSubject");
			Object subjectValue = getSubjectMethod.invoke(dynamicFieldObject);
			if (subjectValue instanceof String && !((String) subjectValue).isEmpty()) {
				subject = (String) subjectValue;
			}

			epAsyncEmailSender.sendMailWithAttachment(recipient, subject, emailBody, placeholders, attachmentData,
					attachmentName, attachmentContentType, ccEmails);

		}
		catch (Exception e) {
			log.error("Unexpected error in email sending process: {}", e.getMessage(), e);
		}
	}

}
