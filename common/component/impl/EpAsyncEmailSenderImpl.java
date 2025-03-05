package com.skapp.enterprise.common.component.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import com.skapp.community.common.component.AsyncEmailSender;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.TooManyRequestsException;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.skapp.enterprise.common.constant.EpApiUriConstants.*;

@Component
@RequiredArgsConstructor
@Slf4j
@Primary
public class EpAsyncEmailSenderImpl implements AsyncEmailSender {

	@Value("${sendgrid.api.key}")
	private String sendGridApiKey;

	@Value("${organization.email}")
	private String organizationEmail;

	private static final Map<EmailBodyTemplates, String> TEMPLATE_MAPPING = initializeTemplateMapping();

	private static Map<EmailBodyTemplates, String> initializeTemplateMapping() {
		return Arrays.stream(EmailBodyTemplates.values()).map(template -> {
			try {
				return Map.entry(template, EpEmailBodyTemplates.valueOf(template.name()).getTemplateId());
			}
			catch (IllegalArgumentException e) {
				return null;
			}
		}).filter(Objects::nonNull).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
	}

	@Override
	public void sendMail(String to, String subject, String htmlBody, EmailBodyTemplates emailTemplate,
			Map<String, String> placeholders) {
		try {
			Email from = new Email(organizationEmail);
			Email toEmail = new Email(to);

			String epTemplateId = getEpTemplateId(emailTemplate);

			if (epTemplateId == null) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_EMAIL_TEMPLATE_NOT_FOUND);
			}

			Mail mail = new Mail();
			mail.setFrom(from);
			mail.setTemplateId(epTemplateId);

			Personalization personalization = new Personalization();
			personalization.addTo(toEmail);

			if (placeholders != null) {
				if (TenantContext.getCurrentTenant() != null
						&& !Objects.equals(TenantContext.getCurrentTenant(), EpCommonConstants.MASTER_DATABASE)) {
					placeholders.put("appUrl", "https://" + TenantContext.getCurrentTenant() + ".skapp.com/signin");
				}

				// set up send_At parameter to schedule email sending time
				if (placeholders.containsKey("sendAt") && !placeholders.get("sendAt").equalsIgnoreCase("null")) {
					mail.setSendAt(Long.parseLong(placeholders.get("sendAt")));
					mail.setBatchId(placeholders.get("batchId"));
				}

				placeholders.forEach(personalization::addDynamicTemplateData);
			}

			mail.addPersonalization(personalization);

			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(SENDGRID_POST_API);
			request.setBody(mail.build());

			Response response = sendGrid.api(request);

			if (response.getStatusCode() == 429) {
				throw new TooManyRequestsException(CommonMessageConstant.COMMON_ERROR_TOO_MANY_REQUESTS_EXCEPTION);
			}

			log.info("Email sent to {} from {} with template: {} and status: {}", to, organizationEmail, epTemplateId,
					response.getStatusCode());
		}
		catch (IOException e) {
			log.error("Error sending email: {}", e.getMessage());
		}
	}

	@Override
	public String getSendGridEmailBatchId() {
		String batchId = null;
		try {
			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(SENDGRID_CREATE_BACTH_ID_API);

			Response response = sendGrid.api(request);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(response.getBody());

			batchId = jsonNode.has("batch_id") ? jsonNode.get("batch_id").asText() : null;
			return batchId;

		}
		catch (IOException e) {
			log.error("Error obtaining batch id: {}", e.getMessage());
		}

		return batchId;
	}

	@Override
	public void cancelScheduledEmails(String batchId, String status) {

		try {

			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(SENDGRID_CANCEL_SCHEDULED_EMAIL);
			String requestBody = String.format("{\"batch_id\": \"%s\", \"status\": \"%s\"}", batchId, status);
			request.setBody(requestBody);

			Response response = sendGrid.api(request);
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private String getEpTemplateId(EmailBodyTemplates emailTemplate) {
		return (emailTemplate != null) ? TEMPLATE_MAPPING.get(emailTemplate) : null;
	}

}
