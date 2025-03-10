package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.payload.email.EmailTemplateMetadata;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.service.impl.EmailServiceImpl;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.type.EmailTemplates;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@Primary
@Slf4j
public class EpEmailServiceImpl extends EmailServiceImpl {

	private static final String EMAIL_LANGUAGE = "en";

	private final OrganizationDao organizationDao;

	public EpEmailServiceImpl(AsyncEmailSender asyncEmailSender, OrganizationDao organizationDao) {
		super(asyncEmailSender);
		this.organizationDao = organizationDao;
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
		log.info("Initializing enum translations map");
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
			EmailTemplateMetadata templateDetails) {
		super.setTemplatePlaceholderData(emailTemplate, placeholders, templateDetails);
		if (emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_EMAIL_VERIFY
				&& emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_SSO_CREATION_TENANT_URL
				&& emailTemplate != EpEmailBodyTemplates.COMMON_MODULE_CREDENTIAL_BASED_CREATION_TENANT_URL) {
			Optional<Organization> organization = organizationDao.findTopByOrderByOrganizationIdDesc();
			organization.ifPresent(value -> {
				placeholders.put("appUrl", value.getAppUrl());
				placeholders.put("organizationName", value.getOrganizationName());
			});
		}

		if (TenantContext.getCurrentTenant() != null
				&& !Objects.equals(TenantContext.getCurrentTenant(), EpCommonConstants.MASTER_DATABASE)) {
			placeholders.put("appUrl", "https://" + TenantContext.getCurrentTenant() + ".skapp.com/signin");
		}
	}

}
