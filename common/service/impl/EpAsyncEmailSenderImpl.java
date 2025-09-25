package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.TooManyRequestsException;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.util.StringUtils;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpApiUriConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.EpAsyncEmailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class EpAsyncEmailSenderImpl implements AsyncEmailSender, EpAsyncEmailSender {

	@Value("${sendgrid.api.key}")
	private String sendGridApiKey;

	@Value("${organization.email}")
	private String organizationEmail;

	@Value("${email.redirect.tenants}")
	private String emailRedirectTenants;

	@Value("${email.redirect.admin-email}")
	private String emailRedirectAdminEmail;

	@Override
	public void sendMail(String to, String subject, String htmlBody, Map<String, String> placeholders) {
		try {
			Mail mail = buildMail(to, subject, htmlBody, placeholders, null, null, null, null);
			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(EpApiUriConstants.SENDGRID_POST_API);
			request.setBody(mail.build());

			Response response = sendGrid.api(request);

			if (response.getStatusCode() == 429) {
				throw new TooManyRequestsException(CommonMessageConstant.COMMON_ERROR_TOO_MANY_REQUESTS_EXCEPTION);
			}
		}
		catch (IOException e) {
			log.error("Error sending email to {}: {}", to, e.getMessage());
		}
	}

	private Mail buildMail(String to, String subject, String htmlBody, Map<String, String> placeholders,
			byte[] attachmentData, String attachmentName, String attachmentContentType, List<String> ccEmails) {
		String senderName = EpCommonConstants.APPLICATION_NAME;
		if (placeholders != null) {
			String module = placeholders.get(EpCommonConstants.MODULE);
			if (EpCommonConstants.ESIGNATURE.equalsIgnoreCase(module)) {
				String sender = placeholders.getOrDefault(EpCommonConstants.SENDER, "");
				if (!StringUtils.isNullOrBlank(sender)) {
					senderName = sender + EpCommonConstants.VIA + EpCommonConstants.APPLICATION_NAME;
				}
			}
			else if (EpCommonConstants.DASHBOARD.equalsIgnoreCase(module)) {
				String sender = placeholders.getOrDefault(EpCommonConstants.SUPER_ADMIN_NAME, "");
				if (!StringUtils.isNullOrBlank(sender)) {
					senderName = sender + EpCommonConstants.VIA + EpCommonConstants.APPLICATION_NAME;
				}
			}
		}
		Email from = new Email(organizationEmail, senderName);
		Email toEmail = createConditionalEmail(to);
		Content content = new Content("text/html", htmlBody);

		Mail mail = new Mail();
		mail.setFrom(from);
		mail.setSubject(Objects.requireNonNull(placeholders).containsKey("envelopeSubject")
				&& !placeholders.get("envelopeSubject").equalsIgnoreCase("null")
						? subject + " " + placeholders.get("envelopeSubject") : subject);
		mail.addContent(content);

		// Add attachment if provided
		if (attachmentData != null && attachmentName != null && attachmentContentType != null) {
			Attachments attachment = new Attachments();
			attachment.setContent(Base64.encodeBase64String(attachmentData));
			attachment.setType(attachmentContentType);
			attachment.setFilename(attachmentName);
			attachment.setDisposition("attachment");
			mail.addAttachments(attachment);
		}

		// set up send_At parameter to schedule email sending time
		if (placeholders.containsKey("sendAt") && !placeholders.get("sendAt").equalsIgnoreCase("null")) {
			mail.setSendAt(Long.parseLong(placeholders.get("sendAt")));
			mail.setBatchId(placeholders.get("batchId"));
		}

		// Add CC if provided
		Personalization personalization = new Personalization();
		personalization.addTo(toEmail);

		if (ccEmails != null && !ccEmails.isEmpty()) {
			for (String cc : ccEmails) {
				personalization.addCc(new Email(cc));
			}
		}
		mail.addPersonalization(personalization);

		return mail;
	}

	@Override
	public void sendMailWithAttachment(String to, String subject, String htmlBody, Map<String, String> placeholders,
			byte[] attachmentData, String attachmentName, String attachmentContentType, List<String> ccEmails) {
		Mail mail = buildMail(to, subject, htmlBody, placeholders, attachmentData, attachmentName,
				attachmentContentType, ccEmails);
		try {
			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(EpApiUriConstants.SENDGRID_POST_API);
			request.setBody(mail.build());

			Response response = sendGrid.api(request);

			if (response.getStatusCode() == 429) {
				throw new TooManyRequestsException(CommonMessageConstant.COMMON_ERROR_TOO_MANY_REQUESTS_EXCEPTION);
			}
		}
		catch (IOException e) {
			log.error("Error sending email with attachment to {}: {}", to, e.getMessage());
		}
	}

	@Override
	public String getSendGridEmailBatchId() {
		String batchId = null;
		try {
			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(EpApiUriConstants.SENDGRID_CREATE_BACTH_ID_API);

			Response response = sendGrid.api(request);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(response.getBody());

			batchId = jsonNode.has("batch_id") ? jsonNode.get("batch_id").asText() : null;

		}
		catch (IOException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_EMAIL_BATCH_ID_NOT_OBTAINED);
		}

		return batchId;
	}

	@Override
	public void cancelScheduledEmails(String batchId, String status) {
		if (batchId == null) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_EMAIL_CANCEL_SCHEDULED_BATCH_ID_NOT_PRESENT);
		}

		if (status == null) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_EMAIL_CANCEL_SCHEDULED_STATUS_NOT_PRESENT);
		}

		try {

			SendGrid sendGrid = new SendGrid(sendGridApiKey);
			Request request = new Request();
			request.setMethod(Method.POST);
			request.setEndpoint(EpApiUriConstants.SENDGRID_CANCEL_SCHEDULED_EMAIL);
			String requestBody = String.format("{\"batch_id\": \"%s\", \"status\": \"%s\"}", batchId, status);
			request.setBody(requestBody);

			sendGrid.api(request);
		}
		catch (IOException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_EMAIL_CANCEL_SCHEDULED_FAILED);
		}
	}

	public Email createConditionalEmail(String originalEmail) {
		String toEmail = Arrays.stream(emailRedirectTenants.split(","))
			.map(String::trim)
			.anyMatch(tenant -> tenant.equals(TenantContext.getCurrentTenant())) ? emailRedirectAdminEmail
					: originalEmail;
		log.info("Email intended for {} is redirected to {}", originalEmail, toEmail);
		return new Email(toEmail);
	}

}
