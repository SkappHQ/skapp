package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.esignature.constant.EsignEmailTitleConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EsignEmailService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.MemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class EsignEmailServiceImpl implements EsignEmailService {

	private final EsignMapper eSignMapper;

	private final UserService userService;

	private final EmailService emailService;

	@Override
	public void resendEnvelopeEmailToRecipient(@NotNull Envelope envelope, @NotNull Recipient recipient,
			@NotNull String documentAccessUrl) {

		log.info("resendEnvelopeToRecipient: process started");

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = getEpEsignEmailEnvelopeDataDto(envelope);

		sendEnvelopeToRecipientEmail(recipient.getAddressBook().getName(), recipient.getAddressBook().getEmail(),
				recipient.getMemberRole().toString(), documentAccessUrl, epEsignEmailDataDto);

		log.info("resendEnvelopeToRecipient: process ended");

	}

	@Override
	public void sendCompleteEmailsToRecipient(Envelope envelope,Recipient mailRecipient,String documentAccessUrl) {
		log.info("sendEmailsToRecipient: execution started");

				EpEsignEnvelopeRecipientEmailDynamicFields recipientEmailFields = initializeEpEsignEmailValues(
						mailRecipient.getName(), envelope.getId(), envelope.getSubject(), envelope.getMessage(),
						concatDocumentNames(envelope.getDocuments()), null, null, null, documentAccessUrl);

				emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
						EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_COMPLETED_RECEIVER_EMAIL, recipientEmailFields,
						mailRecipient.getEmail());

		log.info("sendEmailsToRecipient: execution ended");
	}

	@Override
	public void sendCompleteEmailToSender(Envelope envelope) {
		log.info("sendEmailToSender: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields senderEmailFields = initializeEpEsignEmailValues(
				envelope.getOwner().getInternalUser().getEmployee().getFirstName() + " "
						+ envelope.getOwner().getInternalUser().getEmployee().getLastName(),
				envelope.getId(), envelope.getSubject(), envelope.getMessage(),
				concatDocumentNames(envelope.getDocuments()), null, null, null, null);

		emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_COMPLETED_SENDER_EMAIL, senderEmailFields,
				envelope.getOwner().getInternalUser().getEmail());

		log.info("sendEmailToSender: execution ended");
	}

	private void sendEnvelopeToRecipientEmail(String userName, String userEmail, String memberRole,
			String documentAccessUrl, EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		log.info("sendEnvelopeToRecipientEmail: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userName, epEsignEmailDataDto.getEnvelopeId(), epEsignEmailDataDto.getEnvelopeSubject(),
				epEsignEmailDataDto.getEnvelopeMessage(), epEsignEmailDataDto.getDocumentNames(), null, null, null,
				documentAccessUrl);

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			epEsignEnvelopeRecipientEmailDynamicFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_CC_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

		}
		else {
			epEsignEnvelopeRecipientEmailDynamicFields
				.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
		}

		log.info("sendEnvelopeToRecipientEmail: execution ended");
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
			String declinedBy, String title, String documentAccessUrl) {

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = new EpEsignEnvelopeRecipientEmailDynamicFields();
		epEsignEnvelopeRecipientEmailDynamicFields.setRecipientName(userName);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopId(envelopeId);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeSubject(envelopeSubject);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeMessage(envelopeMessage);
		epEsignEnvelopeRecipientEmailDynamicFields.setSender(userService.getCurrentUser().getEmployee().getFirstName()
				+ " " + userService.getCurrentUser().getEmployee().getLastName());
		epEsignEnvelopeRecipientEmailDynamicFields.setSenderEmail(userService.getCurrentUser().getEmail());
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

}
