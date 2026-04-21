package com.skapp.community.common.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.skapp.community.common.payload.email.EmailTemplateMetadata;
import com.skapp.community.common.payload.request.TestEmailServerRequestDto;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailMainTemplates;
import com.skapp.community.common.type.EmailTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cglib.beans.BeanMap;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

	private static final String EMAIL_LANGUAGE = "en";

	private final AsyncEmailSender asyncEmailSender;

	private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

	protected Map<String, Map<String, List<EmailTemplateMetadata>>> templateDetailsMap;

	protected Map<String, Map<String, Map<String, String>>> enumTranslationsMap;

	@Override
	public void testEmailServer(TestEmailServerRequestDto testEmailServerRequestDto) {
		asyncEmailSender.sendMail(testEmailServerRequestDto.getEmail(), testEmailServerRequestDto.getSubject(),
				testEmailServerRequestDto.getBody(), null);
	}

	@Override
	public void sendEmail(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate, Object dynamicFieldsObject,
			String recipient) {
		processEmailDetails(emailMainTemplate, emailTemplate, dynamicFieldsObject, recipient);
	}

	@Override
	public void sendEmail(EmailTemplates emailTemplate, Object dynamicFieldsObject, String recipient) {
		processEmailDetails(EmailMainTemplates.MAIN_TEMPLATE_V1, emailTemplate, dynamicFieldsObject, recipient);
	}

	private void processEmailDetails(EmailTemplates emailMainTemplate, EmailTemplates emailTemplate,
			Object dynamicFieldsObject, String recipient) {
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

			Map<String, String> placeholders = convertDtoToMap(dynamicFieldsObject);
			placeholders.replaceAll(this::getLocalizedEnumValue);

			setTemplatePlaceholderData(emailTemplate, placeholders, templateDetails, module);

			String emailBody = buildEmailBody(templateDetails, module, placeholders, emailMainTemplate);
			String subject = setSubjectPlaceholders(templateDetails.getSubject(), placeholders);

			asyncEmailSender.sendMail(recipient, subject, emailBody, placeholders);
		}
		catch (Exception e) {
			log.error("Unexpected error in email sending process: {}", e.getMessage(), e);
		}
	}

	/**
	 * The other implementation is available only for Pro tenants.
	 * @param emailTemplate Email template.
	 * @param placeholders Placeholders to replace.
	 */
	protected void setTemplatePlaceholderData(EmailTemplates emailTemplate, Map<String, String> placeholders,
			EmailTemplateMetadata templateDetails, String module) {
		placeholders.put("subject", templateDetails.getSubject());
	}

	private String setSubjectPlaceholders(String subject, Map<String, String> placeholders) {
		for (Map.Entry<String, String> entry : placeholders.entrySet()) {
			String replacement = entry.getValue() == null ? "" : entry.getValue();
			subject = subject.replace("{{" + entry.getKey() + "}}", replacement);
		}
		return subject;
	}

	protected void getEnumTranslationsStream() {
		if (enumTranslationsMap == null) {
			enumTranslationsMap = new HashMap<>();

			loadEnumTranslationsFromPath("community/templates/common/enum-translations.yml");
		}
	}

	protected String getLocalizedEnumValue(String enumKey, String enumValue) {
		getEnumTranslationsStream();
		return Optional.ofNullable(enumTranslationsMap.get(EmailServiceImpl.EMAIL_LANGUAGE))
			.map(langMap -> langMap.get(enumKey))
			.map(enumMap -> enumMap.get(enumValue))
			.orElse(enumValue);
	}

	protected void loadTemplateDetails() {
		if (templateDetailsMap == null) {
			templateDetailsMap = new HashMap<>();

			addTemplatesFromPath("community/templates/email/email-templates.yml");
		}
	}

	protected void addTemplatesFromPath(String path) {
		try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
			Map<String, Map<String, List<EmailTemplateMetadata>>> templates = yamlMapper.readValue(inputStream,
					new TypeReference<>() {
					});

			if (templates != null) {
				for (Map.Entry<String, Map<String, List<EmailTemplateMetadata>>> outerEntry : templates.entrySet()) {
					String outerKey = outerEntry.getKey();
					Map<String, List<EmailTemplateMetadata>> innerMap = outerEntry.getValue();

					templateDetailsMap.computeIfAbsent(outerKey, k -> new HashMap<>());

					for (Map.Entry<String, List<EmailTemplateMetadata>> innerEntry : innerMap.entrySet()) {
						String innerKey = innerEntry.getKey();
						List<EmailTemplateMetadata> metadataList = innerEntry.getValue();

						templateDetailsMap.get(outerKey).put(innerKey, metadataList);
					}
				}
			}
		}
		catch (IOException e) {
			log.warn("Failed to load templates from {}: {}", path, e.getMessage());
		}
	}

	protected void loadEnumTranslationsFromPath(String path) {
		try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
			Map<String, Map<String, Map<String, String>>> translations = yamlMapper.readValue(inputStream,
					new TypeReference<>() {
					});

			if (translations != null) {
				for (Map.Entry<String, Map<String, Map<String, String>>> outerEntry : translations.entrySet()) {
					String language = outerEntry.getKey();
					Map<String, Map<String, String>> enumTypesMap = outerEntry.getValue();

					enumTranslationsMap.computeIfAbsent(language, k -> new HashMap<>());

					for (Map.Entry<String, Map<String, String>> innerEntry : enumTypesMap.entrySet()) {
						String enumType = innerEntry.getKey();
						Map<String, String> newTranslations = innerEntry.getValue();

						enumTranslationsMap.get(language).compute(enumType, (key, existingTranslations) -> {
							if (existingTranslations == null) {
								return new HashMap<>(newTranslations);
							}
							else {
								existingTranslations.putAll(newTranslations);
								return existingTranslations;
							}
						});
					}
				}
			}
		}
		catch (IOException e) {
			log.warn("Failed to load enum translations from {}: {}", path, e.getMessage());
		}
	}

	protected EmailTemplateMetadata getTemplateDetails(String templateId) {
		loadTemplateDetails();
		return templateDetailsMap.getOrDefault(EMAIL_LANGUAGE, Collections.emptyMap())
			.values()
			.stream()
			.flatMap(Collection::stream)
			.filter(template -> template.getId().equals(templateId))
			.findFirst()
			.orElse(null);
	}

	protected String findModuleForTemplate(String templateId) {
		loadTemplateDetails();
		return templateDetailsMap.getOrDefault(EMAIL_LANGUAGE, Collections.emptyMap())
			.entrySet()
			.stream()
			.filter(entry -> entry.getValue().stream().anyMatch(template -> template.getId().equals(templateId)))
			.map(Map.Entry::getKey)
			.findFirst()
			.orElse(null);
	}

	protected String buildEmailBody(EmailTemplateMetadata templateDetails, String module,
			Map<String, String> placeholders, EmailTemplates emailMainTemplate) throws IOException {
		String templatePath = buildTemplatePath(module, templateDetails.getId());
		String body = replaceValuesToTemplate(templatePath, placeholders);

		String mainTemplatePath = buildMainTemplatePath(emailMainTemplate);
		Map<String, String> updatedPlaceholders = new HashMap<>(placeholders);
		updatedPlaceholders.put("body", body);

		return replaceValuesToTemplate(mainTemplatePath, updatedPlaceholders);
	}

	protected String buildTemplatePath(String module, String templateId) {
		return findExistingPath(
				String.format("community/templates/email/%s/%s/%s.html", EMAIL_LANGUAGE, module, templateId));
	}

	protected String buildMainTemplatePath(EmailTemplates emailMainTemplate) {
		return findExistingPath(String.format("community/templates/email/%s/%s.html", EMAIL_LANGUAGE,
				emailMainTemplate.getTemplateId()));
	}

	protected String findExistingPath(String... paths) {
		for (String path : paths) {
			if (new ClassPathResource(path).exists()) {
				return path;
			}
		}
		throw new IllegalArgumentException("No valid template found in community or enterprise directories.");
	}

	private String replaceValuesToTemplate(String templatePath, Map<String, String> placeholders) throws IOException {
		ClassPathResource resource = new ClassPathResource(templatePath);
		String templateContent = new String(resource.getInputStream().readAllBytes());
		for (Map.Entry<String, String> entry : placeholders.entrySet()) {
			String replacement = entry.getValue() == null ? "" : entry.getValue();
			templateContent = templateContent.replace("{{" + entry.getKey() + "}}", replacement);
		}
		return templateContent;
	}

	protected Map<String, String> convertDtoToMap(Object data) {
		Map<String, String> placeholders = new HashMap<>();
		BeanMap beanMap = BeanMap.create(data);
		for (Object entry : beanMap.entrySet()) {
			Map.Entry<?, ?> mapEntry = (Map.Entry<?, ?>) entry;
			placeholders.put(mapEntry.getKey().toString(), String.valueOf(mapEntry.getValue()));
		}
		return placeholders;
	}

}
