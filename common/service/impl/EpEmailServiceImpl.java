package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.component.AsyncEmailSender;
import com.skapp.community.common.payload.email.EmailTemplateMetadata;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.impl.EmailServiceImpl;
import com.skapp.community.common.type.EmailMainTemplates;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Primary
public class EpEmailServiceImpl extends EmailServiceImpl {

	private static final String EMAIL_LANGUAGE = "en";

	private Map<String, Map<String, List<EmailTemplateMetadata>>> templateDetailsMap;

	public EpEmailServiceImpl(AsyncEmailSender asyncEmailSender, OrganizationDao organizationDao) {
		super(asyncEmailSender, organizationDao);
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
	protected String buildTemplatePath(String module, String templateId) {
		return findExistingPath(
				String.format("community/templates/email/%s/%s/%s.html", EMAIL_LANGUAGE, module, templateId),
				String.format("enterprise/templates/email/%s/%s/%s.html", EMAIL_LANGUAGE, module, templateId));
	}

	protected String buildMainTemplatePath() {
		return findExistingPath(
				String.format("community/templates/email/%s/%s.html", EMAIL_LANGUAGE,
						EmailMainTemplates.MAIN_TEMPLATE_V1.getTemplateId()),
				String.format("enterprise/templates/email/%s/%s.html", EMAIL_LANGUAGE,
						EmailMainTemplates.MAIN_TEMPLATE_V1.getTemplateId()));
	}

}
