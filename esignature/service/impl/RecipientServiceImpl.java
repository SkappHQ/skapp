package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.EpEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.esignature.constant.EsignEmailTitleConstant;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecipientServiceImpl implements RecipientService {

	private final RecipientRepository recipientRepository;

	private final EsignMapper eSignMapper;

	private final EmailService emailService;

	private final EpEmailService epEmailService;

	private final UserService userService;

	private final DocumentLinkService documentLinkService;

	@Override
	public ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId) {

		return findNextRecipientAndSendEmail(Optional.ofNullable(recipientId), envelopeId);

	}

	private ResponseEntityDto findNextRecipientAndSendEmail(Optional<Long> recipientId, Long envelopeId) {

		log.info("findNextRecipient: execution started");

		List<Recipient> nextRecipientList = getNextSignRecipientData(recipientId, envelopeId);

		return sendEmailToNextRecipients(nextRecipientList);
	}

	@Override
	public ResponseEntityDto sendEmailToNextRecipients(List<Recipient> nextRecipientList) {
		if (nextRecipientList.isEmpty()) {
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE);
		}

		Envelope envelopeData = nextRecipientList.getFirst().getEnvelope();

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

		// After obtaining the next in line recipient, implement the email sender
		log.info("sendEnvelopToRecipientEmail: process started");

		List<Long> recipientIdList = new ArrayList<>();

		nextRecipientList.forEach(recipient -> {
			recipientIdList.add(recipient.getId());
			DocumentPermissionType permissionType = DocumentPermissionType.WRITE;
			if (MemberRole.CC.toString().equalsIgnoreCase(recipient.getMemberRole().name())) {
				permissionType = DocumentPermissionType.READ;
			}
			DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(envelopeData.getId(),
					recipient.getId(), permissionType);
			DocumentLinkResponseDto documentLink = documentLinkService.generateDocumentAccessUrl(documentAccessUrlDto);
			String documentAccessUrl = documentLink.getUrl();

			sendEnvelopToRecipientEmail(recipient.getId(), recipient.getAddressBook().getName(),
					recipient.getAddressBook().getEmail(), recipient.getMemberRole().toString(), documentAccessUrl,
					epEsignEmailDataDto);
		});
		log.info("sendEnvelopToRecipientEmail: process ended");

		return new ResponseEntityDto(false, recipientIdList);
	}

	@Override
	public List<Recipient> getNextSignRecipientData(Optional<Long> recipientId, Long envelopeId) {
		Optional<List<Recipient>> recipientListOptional = recipientRepository.findByEnvelopeId(envelopeId);

		// If no recipients found for the given Document Id, return an empty response
		if (recipientListOptional.isEmpty()) {
			return new ArrayList<>();
		}

		List<Recipient> recipientList = recipientListOptional.get();

		List<Recipient> sortedRecipientList = new ArrayList<>();

		// When the very first recipient is not known the recipientId is optional. In that
		// case if the recipientId is not available
		// order the recipient list first from the id and then from the signingOrder and
		// add to the sortedRecipientList list
		if (recipientId.isPresent()) {
			// validate if the recipientId is a valid recipient for the given envelopeId
			if (recipientList.stream().noneMatch(recipient -> recipient.getId().equals(recipientId.get()))) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NOT_VALID_RECIPIENT_FOR_ENVELOPE);
			}

			int currentSigningOrderId = recipientId
				.flatMap(id -> recipientList.stream()
					.filter(recipient -> recipient.getId().equals(id))
					.map(Recipient::getSigningOrder)
					.findFirst())
				.orElse(-1);

			if (currentSigningOrderId == -1) {
				return new ArrayList<>();
			}

			sortedRecipientList.addAll(recipientList.stream()
				.filter(recpt -> recpt.getSigningOrder() > currentSigningOrderId)
				.sorted(Comparator.comparing(Recipient::getSigningOrder))
				.toList());
		}
		else {
			sortedRecipientList.addAll(recipientList.stream()
				.sorted(Comparator.comparing(Recipient::getId).thenComparing(Recipient::getSigningOrder))
				.toList());
		}

		// If no next available recipient available, return an empty response
		if (sortedRecipientList.isEmpty()) {
			return new ArrayList<>();
		}

		List<Recipient> tempRecipientList = new ArrayList<>(sortedRecipientList);
		List<Recipient> nextRecipientList = new ArrayList<>();

		// List derive based on the member role. If next in line recipient is a CC role,
		// then pick the recipient list up until the next Signer to send simultaneously.
		for (Recipient currentRecipient : tempRecipientList) {
			if (MemberRole.SIGNER.equals(currentRecipient.getMemberRole())) {
				nextRecipientList.add(currentRecipient);

				break;

			}
			else if (MemberRole.CC.equals(currentRecipient.getMemberRole())) {
				nextRecipientList.add(currentRecipient);
			}
		}

		return nextRecipientList;

	}

	private void sendEnvelopToRecipientEmail(Long recipientId, String userName, String userEmail, String memberRole,
			String documentAccessUrl, EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		log.info("sendEnvelopToRecipientEmail: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userName, epEsignEmailDataDto.getEnvelopeId(), epEsignEmailDataDto.getEnvelopeSubject(),
				epEsignEmailDataDto.getEnvelopeMessage(), epEsignEmailDataDto.getDocumentNames(), null, null, null,
				documentAccessUrl);

		Envelope envelope = new Envelope();
		envelope.setId(epEsignEmailDataDto.getEnvelopeId());

		RecipientUpdateDto recipientUpdateDto = new RecipientUpdateDto();

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			epEsignEnvelopeRecipientEmailDynamicFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_CC_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

			recipientUpdateDto = initializerecipientDtoData(null, null, null, EmailStatus.SENT);
		}
		else {
			epEsignEnvelopeRecipientEmailDynamicFields
				.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

			// For Signer if the reminder frequency for the Envelope is set by the sender,
			// schedule emails to be sent out apart from the initial email.

			// To schedule sendgrid emails, the sending time should be mentioned in
			// Unix Timestamp, therefore obtain the current timestamp in unix to calculate
			// next scheduling times from the
			// current time.
			Long initialUnixTimestamp = Instant.now().getEpochSecond();

			if (epEsignEmailDataDto.getReminderDays() != null) {
				int emailCount = EpCommonConstants.SENDGRID_EMAIL_SCHEDULE_MAX_HOURS / EpCommonConstants.HOURS_A_DAY;
				int schdeuledEmailCount = 1;

				// A SendGrid batch id is obtained to track scheduled emails.
				// To be sent along with the email personalization as it is to be used in
				// case of canceling the schedule.
				String obtainedBatchId = epEmailService.obtainSendGridBatchId();
				epEsignEnvelopeRecipientEmailDynamicFields.setBatchId(obtainedBatchId);

				int reminderCount = epEsignEmailDataDto.getReminderDays() == 1 ? emailCount : 1;

				while (reminderCount >= schdeuledEmailCount) {

					epEsignEnvelopeRecipientEmailDynamicFields.setSendAt(reminderCount != 1
							? initialUnixTimestamp + ChronoUnit.DAYS.getDuration().getSeconds() * schdeuledEmailCount
							: initialUnixTimestamp + ChronoUnit.DAYS.getDuration().getSeconds()
									* epEsignEmailDataDto.getReminderDays());

					emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
							EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
							epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

					schdeuledEmailCount++;
				}

				// Save the scheduled email batch id for future references like cancelling
				// the schedule
				recipientUpdateDto = initializerecipientDtoData(null, obtainedBatchId, EmailReminderStatus.SCHEDULED,
						EmailStatus.SENT);
			}
		}

		updateRecipient(recipientId, recipientUpdateDto);
		log.info("sendEnvelopToRecipientEmail: execution ended");
	}

	@Override
	public ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto) {
		log.info("updateRecipient: execution started");

		Optional<Recipient> optionalUpdatableRecipient = recipientRepository.findById(recipientId);

		if (optionalUpdatableRecipient.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENT_FOUND);
		}

		Recipient updatableRecipient = optionalUpdatableRecipient.get();

		if (recipientUpdateDto.getReminderBatchId() != null) {
			updatableRecipient.setReminderBatchId(recipientUpdateDto.getReminderBatchId());
		}

		if (recipientUpdateDto.getReminderStatus() != null) {
			updatableRecipient.setReminderStatus(recipientUpdateDto.getReminderStatus());
		}

		if (recipientUpdateDto.getEmailStatus() != null) {
			updatableRecipient.setEmailStatus(recipientUpdateDto.getEmailStatus());
		}

		Recipient updatedRecipient = recipientRepository.save(updatableRecipient);
		RecipientDetailResponseDto responseDto = eSignMapper.recipientToRecipientDetailDto(updatedRecipient);

		log.info("updateRecipient: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	/**
	 * @param recipientId
	 * @param envelopeId
	 * @return
	 *
	 * This method cancels any scheduled reminders to Signers If any reminders are set,
	 * upon signer approving or declining the document before the next reminder is sent.
	 */
	@Override
	public ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId) {
		log.info("cancelEmailReminders: execution started");

		Optional<Recipient> recipientOptional = recipientRepository.findByIdAndEnvelopeId(recipientId, envelopeId);

		ResponseEntityDto responseEntityDto = new ResponseEntityDto(true,
				eSignMapper.recipientToRecipientDetailDto(new Recipient()));

		if (recipientOptional.isPresent()) {

			Recipient recipient = recipientOptional.get();

			if (recipient.getReminderBatchId() != null && MemberRole.SIGNER == recipient.getMemberRole()) {
				epEmailService.cancelScheduledEmail(recipient.getReminderBatchId(),
						EpCommonConstants.SENDGRID_CANCEL_SCHEDULED_MAIL);

				RecipientUpdateDto recipientUpdateDto = initializerecipientDtoData(null, null,
						EmailReminderStatus.CANCELLED, null);

				responseEntityDto = updateRecipient(recipientId, recipientUpdateDto);
			}
		}
		log.info("cancelEmailReminders: execution ended");

		return responseEntityDto;
	}

	/**
	 * @param envelopeId
	 * @return This method sends email to signers/cc/sender if the document id voided or
	 * declined by any of the receivers.
	 */
	@Override
	public ResponseEntityDto sendEmailWhenDocumentIsVoidedOrDeclined(Long envelopeId) {
		log.info("sendEmailWhenDocumentIsVoidedOrDeclined: execution started");

		EnvelopeDetailedResponseDto envelopeDetailedResponseDto = eSignMapper
			.envelopeToEnvelopeDetailedResponseDto(new Envelope());

		Optional<List<Recipient>> optionalRecipientList = recipientRepository.findByEnvelopeIdAndEmailStatus(envelopeId,
				EmailStatus.SENT);

		// If no recipients found for the given Document Id, return an empty response
		if (optionalRecipientList.isPresent()) {

			List<Recipient> recipientList = optionalRecipientList.get();

			Envelope envelope = recipientList.getFirst().getEnvelope();

			// if Declined find who declined the document
			String declinedBy;
			String voidOrDeclinedReason;
			String title;
			if (envelope.getStatus() == EnvelopeStatus.DECLINED) {
				declinedBy = obtainEnvelopeDeclinedBy(recipientList);
				voidOrDeclinedReason = envelope.getVoidReason();
				title = EsignEmailTitleConstant.ESIGN_ENVELOPE_DECLINED_EMAIL_TITLE;
			}
			else if (envelope.getStatus() == EnvelopeStatus.VOIDED) {
				declinedBy = null;
				voidOrDeclinedReason = envelope.getVoidReason();
				title = EsignEmailTitleConstant.ESIGN_ENVELOPE_VOIDED_EMAIL_TITLE;
			}
			else {
				declinedBy = null;
				voidOrDeclinedReason = null;
				title = null;
			}

			// for each recipient that email has already been sent, send the status update
			// email.
			Envelope finalEnvelope = envelope;
			recipientList.forEach(rcpt -> {

				// If any Reminders are been scheduled about the initial state of the
				// document, cancel them
				if (rcpt.getReminderBatchId() != null && rcpt.getReminderStatus() == EmailReminderStatus.SCHEDULED) {
					cancelEmailReminders(rcpt.getId(), finalEnvelope.getId());
				}

				String documentName = concatDocumentNames(rcpt.getEnvelope().getDocuments());

				EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
						rcpt.getAddressBook().getName(), rcpt.getEnvelope().getId(), finalEnvelope.getSubject(),
						finalEnvelope.getMessage(), documentName, voidOrDeclinedReason, declinedBy, title, null);

				sendEmailBasedOnRoleAndEnvelopeStatus(rcpt.getMemberRole(), finalEnvelope.getStatus(),
						epEsignEnvelopeRecipientEmailDynamicFields, rcpt.getAddressBook().getEmail());
			});

			// Send the mail to the Sender
			String documentName = concatDocumentNames(envelope.getDocuments());

			EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
					userService.getCurrentUser().getEmployee().getFirstName() + " "
							+ userService.getCurrentUser().getEmployee().getLastName(),
					envelopeId, envelope.getSubject(), envelope.getMessage(), documentName, voidOrDeclinedReason,
					declinedBy, title, null);
			sendEmailBasedOnRoleAndEnvelopeStatus(null, envelope.getStatus(),
					epEsignEnvelopeRecipientEmailDynamicFields, userService.getCurrentUser().getEmail());

			envelopeDetailedResponseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope);

		}

		log.info("sendEnvelopeInvalidEmail: execution ended");
		return new ResponseEntityDto(false, envelopeDetailedResponseDto);
	}

	/**
	 * @param userName
	 * @param envelopeId
	 * @param envelopeSubject
	 * @param envelopeMessage
	 * @param documentName
	 * @return This method initialize all necessary values to map to the customized email
	 * object
	 */
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

	/**
	 * @param memberRole
	 * @param envelopeStatus
	 * @param epEsignEnvelopeRecipientEmailDynamicFields
	 * @param userEmail This method is used to send emails based on the role, if any
	 * status to the envelope/document is made.
	 */
	private void sendEmailBasedOnRoleAndEnvelopeStatus(MemberRole memberRole, EnvelopeStatus envelopeStatus,
			EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields, String userEmail) {

		if (EnvelopeStatus.inactiveStatuses().contains(envelopeStatus)) {
			if (MemberRole.SIGNER == memberRole || MemberRole.CC == memberRole) {
				switch (envelopeStatus) {
					case EnvelopeStatus.VOIDED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_DECLINED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;
				}
			}
			else {
				// Send email to the Sender
				switch (envelopeStatus) {
					case EnvelopeStatus.VOIDED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_SENDER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_MAIN_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_DECLINED_SENDER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;
				}
			}
		}
	}

	/**
	 * @param recipients
	 * @return This method is used to find who declined the envelope in order to mention
	 * that in the email
	 */
	private String obtainEnvelopeDeclinedBy(List<Recipient> recipients) {

		Optional<Recipient> declinedRecipient = recipients.stream()
			.filter(recpt -> recpt.getStatus() == RecipientStatus.DECLINED)
			.findFirst();

		if (declinedRecipient.isPresent()) {
			return declinedRecipient.get().getAddressBook().getName();
		}
		return null;
	}

	private RecipientUpdateDto initializerecipientDtoData(RecipientStatus recipientStatus, String reminderBatchId,
			EmailReminderStatus reminderStatus, EmailStatus emailStatus) {

		RecipientUpdateDto recipientUpdateDto = new RecipientUpdateDto();

		recipientUpdateDto.setStatus(recipientStatus);
		recipientUpdateDto.setReminderBatchId(reminderBatchId);
		recipientUpdateDto.setReminderStatus(reminderStatus);
		recipientUpdateDto.setEmailStatus(emailStatus);

		return recipientUpdateDto;
	}

	/**
	 * @param documents
	 * @return If there are multiple documents in a single envelope, concat the document
	 * names in order to build the email subject.
	 */
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
