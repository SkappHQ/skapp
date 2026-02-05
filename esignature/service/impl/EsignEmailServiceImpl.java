package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.model.Organization;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailButtonText;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.esignature.constant.EsignEmailTitleConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.service.EsignEmailService;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.util.EsignUtil;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EsignEmailServiceImpl implements EsignEmailService {

	public static final String ENVELOP_LINK = "/sign/sent/envelope/";

	private final EsignMapper eSignMapper;

	private final EmailService emailService;

	private final OrganizationDao organizationDao;

	private final NotificationService notificationService;

	@Value("${app.protocol}")
	private String protocol;

	@Value("${app.parent-domain}")
	private String parentDomain;

	@Override
	public void resendEnvelopeEmailToRecipient(@NotNull Envelope envelope, @NotNull Recipient recipient,
			@NotNull String documentAccessUrl) {

		log.info("resendEnvelopeToRecipient: process started");

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = getEpEsignEmailEnvelopeDataDto(envelope);

		sendEnvelopeToRecipientEmail(recipient, documentAccessUrl, epEsignEmailDataDto);

		log.info("resendEnvelopeToRecipient: process ended");

	}

	@Override
	public void sendCompleteEmailsToRecipient(Envelope envelope, Recipient mailRecipient, String documentAccessUrl) {
		log.info("sendEmailsToRecipient: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields recipientEmailFields = initializeEpEsignEmailValues(
				mailRecipient.getAddressBook().getName(), envelope.getId(), envelope.getSubject(),
				envelope.getMessage(), concatDocumentNames(envelope.getDocuments()), null, null,
				EsignEmailTitleConstant.ESIGN_ENVELOPE_COMPLETED_EMAIL_TITLE, documentAccessUrl,
				envelope.getOwner().getName(), envelope.getOwner().getEmail());

		emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
				EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_COMPLETED_RECEIVER_EMAIL, recipientEmailFields,
				mailRecipient.getAddressBook().getEmail());

		log.info("sendEmailsToRecipient: execution ended");
	}

	@Override
	public void sendCompleteEmailToSender(Envelope envelope) {
		log.info("sendEmailToSender: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields senderEmailFields = initializeEpEsignEmailValues(
				envelope.getOwner().getInternalUser().getEmployee().getFirstName() + " "
						+ envelope.getOwner().getInternalUser().getEmployee().getLastName(),
				envelope.getId(), envelope.getSubject(), envelope.getMessage(),
				concatDocumentNames(envelope.getDocuments()), null, null,
				EsignEmailTitleConstant.ESIGN_ENVELOPE_COMPLETED_EMAIL_TITLE, null, envelope.getOwner().getName(),
				envelope.getOwner().getEmail());

		senderEmailFields.setButtonText(EpEmailButtonText.ESIGN_EMAIL_SENDER_BUTTON_TEXT.name());
		Optional<Organization> organization = organizationDao.findTopByOrderByOrganizationIdDesc();
		organization.ifPresent(value -> {
			senderEmailFields.setDocumentAccessUrl(getDocumentAccessUrlForSender(envelope));
		});

		emailService.sendEmail(EpEmailMainTemplates.ESIGN_SENDER_TEMPLATE_V1,
				EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_COMPLETED_SENDER_EMAIL, senderEmailFields,
				envelope.getOwner().getInternalUser().getEmail());

		log.info("sendEmailToSender: execution ended");
	}

	private void sendEnvelopeToRecipientEmail(Recipient recipient, String documentAccessUrl,
			EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		String userName = recipient.getAddressBook().getName();
		String userEmail = recipient.getAddressBook().getEmail();
		String memberRole = recipient.getMemberRole().toString();

		log.info("sendEnvelopeToRecipientEmail: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userName, epEsignEmailDataDto.getEnvelopeId(), epEsignEmailDataDto.getEnvelopeSubject(),
				epEsignEmailDataDto.getEnvelopeMessage(), epEsignEmailDataDto.getDocumentNames(), null, null, null,
				documentAccessUrl, recipient.getEnvelope().getOwner().getName(),
				recipient.getEnvelope().getOwner().getEmail());

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			epEsignEnvelopeRecipientEmailDynamicFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_CC_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

		}
		else {
			if (recipient.getEnvelope().getStatus() == EnvelopeStatus.COMPLETED) {
				epEsignEnvelopeRecipientEmailDynamicFields
					.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_COMPLETED_EMAIL_TITLE);
				emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
						EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_COMPLETED_RECEIVER_EMAIL,
						epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
			}
			else {
				epEsignEnvelopeRecipientEmailDynamicFields
					.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);
				emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
						EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
						epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
			}
		}

		log.info("sendEnvelopeToRecipientEmail: execution ended");
	}

	@Override
	public void sendNudgeEmail(Recipient recipient, String documentLinkUrl) {
		log.info("sendReminderEmail: Sending reminder email to recipient with ID {}", recipient.getId());

		EpEsignEnvelopeRecipientEmailDynamicFields emailFields = initializeEpEsignEmailValues(
				recipient.getAddressBook().getName(), recipient.getEnvelope().getId(),
				recipient.getEnvelope().getSubject(), recipient.getEnvelope().getMessage(),
				concatDocumentNames(recipient.getEnvelope().getDocuments()), null, null, null, documentLinkUrl,
				recipient.getEnvelope().getOwner().getName(), recipient.getEnvelope().getOwner().getEmail());
		emailFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);

		emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
				EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_EMAIL_REMINDER, emailFields,
				recipient.getAddressBook().getEmail());

		log.info("sendReminderEmail: Reminder email sent successfully to recipient with ID {}", recipient.getId());
	}

	private EpEsignEmailEnvelopeDataDto getEpEsignEmailEnvelopeDataDto(Envelope envelopeData) {
		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = eSignMapper
			.envelopeToEpEsignEmailEnvelopeDataDto(envelopeData);

		String documentName = null;

		for (Document document : envelopeData.getDocuments()) {
			if (documentName == null) {
				documentName = document.getName();
			}
			else {
				documentName = documentName.concat(" & ").concat(document.getName());
			}
		}

		epEsignEmailDataDto.setDocumentNames(documentName);
		return epEsignEmailDataDto;
	}

	private EpEsignEnvelopeRecipientEmailDynamicFields initializeEpEsignEmailValues(String userName, Long envelopeId,
			String envelopeSubject, String envelopeMessage, String documentName, String voidDeclinedReason,
			String declinedBy, String title, String documentAccessUrl, String name, String email) {

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = new EpEsignEnvelopeRecipientEmailDynamicFields();
		epEsignEnvelopeRecipientEmailDynamicFields.setRecipientName(userName);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopId(envelopeId);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeSubject(envelopeSubject);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeMessage(envelopeMessage);
		epEsignEnvelopeRecipientEmailDynamicFields.setSender(name);
		epEsignEnvelopeRecipientEmailDynamicFields.setSenderEmail(email);
		epEsignEnvelopeRecipientEmailDynamicFields.setDocumentNames(documentName);
		epEsignEnvelopeRecipientEmailDynamicFields.setVoidReason(voidDeclinedReason);
		epEsignEnvelopeRecipientEmailDynamicFields.setDeclinedBy(declinedBy);
		epEsignEnvelopeRecipientEmailDynamicFields.setTitle(title);

		if (documentAccessUrl != null)
			epEsignEnvelopeRecipientEmailDynamicFields.setDocumentAccessUrl(documentAccessUrl);

		return epEsignEnvelopeRecipientEmailDynamicFields;
	}

	private String concatDocumentNames(List<Document> documents) {
		String documentName = null;

		for (Document document : documents) {
			if (documentName == null) {
				documentName = document.getName();
			}
			else {
				documentName = documentName.concat(" & ").concat(document.getName());
			}
		}

		return documentName;
	}

	@Override
	public String getDocumentAccessUrlForSender(Envelope envelope) {
		return protocol + "://" + TenantContext.getCurrentTenant() + "." + parentDomain + ENVELOP_LINK
				+ envelope.getId();
	}

}
