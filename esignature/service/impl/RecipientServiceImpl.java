package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.EpEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailButtonText;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.esignature.constant.EsignEmailTitleConstant;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.email.EsignEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.repository.RecipientDao;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.EsignEmailService;
// import com.skapp.enterprise.esignature.service.EsignNotificationService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.SignType;
import com.skapp.enterprise.esignature.util.EsignUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecipientServiceImpl implements RecipientService {

	private final RecipientDao recipientDao;

	private final EsignMapper eSignMapper;

	private final EmailService emailService;

	private final EpEmailService epEmailService;

	private final UserService userService;

	private final DocumentLinkService documentLinkService;

	private final EsignEmailService esignEmailService;

	private final NotificationService notificationService;

	// private final EsignNotificationService esignNotificationService;

	@Override
	public DocumentLinksAndRecipientsData prepareDocumentFirstRecipients(List<Recipient> recipients,
			SignType signType) {
		log.info("prepareDocumentFirstRecipients: execution started");

		List<Recipient> nextRecipientList = signType.equals(SignType.SEQUENTIAL)
				? getNextInLineRecipients(Optional.empty(), recipients) : recipients;

		if (nextRecipientList.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE);
		}

		Envelope envelopeData = nextRecipientList.getFirst().getEnvelope();

		List<DocumentLink> documentLinkList = new ArrayList<>();
		Map<Long, String> recipientAccessUrls = new HashMap<>();

		List<Recipient> updatedRecipients = nextRecipientList.stream().map(recipient -> {

			DocumentPermissionType permissionType = MemberRole.CC.toString()
				.equalsIgnoreCase(recipient.getMemberRole().name()) ? DocumentPermissionType.READ
						: DocumentPermissionType.WRITE;

			DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(
					envelopeData.getDocuments().getFirst().getId(), recipient.getId(), permissionType);

			documentLinkService.validatePermissionForGenerateAccessUrl(recipient.getEnvelope(), recipient,
					documentAccessUrlDto.getPermissionType());

			DocumentLinkService.DocumentLinkData documentLinkData = documentLinkService.createDocumentLinkData(
					documentAccessUrlDto, recipient, envelopeData.getDocuments().getFirst(), envelopeData);

			documentLinkList.add(documentLinkData.documentLink());
			recipientAccessUrls.put(recipient.getId(), documentLinkData.accessUrl());

			// esignNotificationService.notifyRecipientOnSignRequest(recipient,
			// 		envelopeData.getDocuments().getFirst().getId().toString(), envelopeData.getId().toString());

			return prepareRecipientMetadata(recipient);
		}).toList();

		log.info("prepareDocumentFirstRecipients: execution end");

		return new DocumentLinksAndRecipientsData(documentLinkList, updatedRecipients, recipientAccessUrls);
	}

	@Override
	public DocumentLinksAndRecipientsData prepareNextRecipients(List<Recipient> nextRecipientList, Document document) {
		log.info("prepareNextRecipients: process started");

		if (nextRecipientList.isEmpty()) {
			return new DocumentLinksAndRecipientsData(Collections.emptyList(), Collections.emptyList(),
					Collections.emptyMap());
		}

		if (document.getEnvelope() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ENVELOPE_NOT_FOUND);
		}

		Envelope envelopeData = document.getEnvelope();

		List<DocumentLink> documentLinkList = new ArrayList<>();
		Map<Long, String> recipientAccessUrls = new HashMap<>();

		List<Recipient> updatedRecipients = nextRecipientList.stream().map(recipient -> {

			DocumentPermissionType permissionType = MemberRole.CC.toString()
				.equalsIgnoreCase(recipient.getMemberRole().name()) ? DocumentPermissionType.READ
						: DocumentPermissionType.WRITE;

			DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(document.getId(), recipient.getId(),
					permissionType);

			documentLinkService.validatePermissionForGenerateAccessUrl(envelopeData, recipient,
					documentAccessUrlDto.getPermissionType());

			DocumentLinkService.DocumentLinkData documentLinkData = documentLinkService
				.createDocumentLinkData(documentAccessUrlDto, recipient, document, envelopeData);

			documentLinkList.add(documentLinkData.documentLink());
			recipientAccessUrls.put(recipient.getId(), documentLinkData.accessUrl());

			// esignNotificationService.notifyRecipientOnSignRequest(recipient, document.getId().toString(),
			// 		document.getEnvelope().getId().toString());

			return prepareRecipientMetadata(recipient);
		}).toList();

		log.info("prepareNextRecipients: process ended");

		return new DocumentLinksAndRecipientsData(documentLinkList, updatedRecipients, recipientAccessUrls);
	}

	/*
	 * TODO: Decouple reminder scheduling from email sending - reminder scheduling
	 * (handleReminderScheduling) is currently embedded inside
	 * sendEnvelopeToRecipientEmail, which forces us to persist reminder metadata
	 * (batchId, status) here after the fact. These should be separate concerns.
	 */
	@Async
	@Transactional
	@Override
	public void sendEnvelopeEmailNotifications(Long envelopeId, Map<Long, String> recipientAccessUrls) {
		if (envelopeId == null) {
			log.warn("sendEnvelopeEmailNotifications: envelopeId is null, skipping email notifications");
			return;
		}

		Envelope envelope = recipientDao.findByEnvelopeId(envelopeId)
			.filter(recipients -> !recipients.isEmpty())
			.map(recipients -> recipients.getFirst().getEnvelope())
			.orElse(null);

		if (envelope == null) {
			log.warn("sendEnvelopeEmailNotifications: envelope not found for id {}, skipping email notifications",
					envelopeId);
			return;
		}

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = getEpEsignEmailEnvelopeDataDto(envelope);

		List<Recipient> recipients = envelope.getRecipients();
		if (recipients == null || recipients.isEmpty()) {
			return;
		}

		recipients.forEach(recipient -> {
			String documentAccessUrl = recipientAccessUrls.get(recipient.getId());
			if (documentAccessUrl != null) {
				Recipient updatedRecipient = sendEnvelopeToRecipientEmail(recipient,
						recipient.getAddressBook().getName(), recipient.getAddressBook().getEmail(),
						recipient.getMemberRole().toString(), documentAccessUrl, epEsignEmailDataDto);
				recipientDao.save(updatedRecipient);
			}
		});
	}

	@Override
	public List<Recipient> getNextSignRecipientData(Optional<Long> recipientId, Long envelopeId) {
		Optional<List<Recipient>> recipientListOptional = recipientDao.findByEnvelopeId(envelopeId);

		// If no recipients found for the given Document Id, return an empty response
		if (recipientListOptional.isEmpty()) {
			return new ArrayList<>();
		}

		List<Recipient> recipientList = recipientListOptional.get();

		return getNextInLineRecipients(recipientId, recipientList);
	}

	@Async
	@Transactional
	@Override
	public void sendDocumentCompletedEmailNotifications(Long envelopeId, Map<Long, String> recipientAccessUrls) {
		if (envelopeId == null) {
			log.warn("sendDocumentCompletedEmailNotifications: envelopeId is null, skipping email notifications");
			return;
		}

		Envelope envelope = recipientDao.findByEnvelopeId(envelopeId)
			.filter(recipients -> !recipients.isEmpty())
			.map(recipients -> recipients.getFirst().getEnvelope())
			.orElse(null);

		if (envelope == null) {
			log.warn(
					"sendDocumentCompletedEmailNotifications: envelope not found for id {}, skipping email notifications",
					envelopeId);
			return;
		}

		envelope.getRecipients().forEach(mailRecipient -> {
			String documentAccessUrl = recipientAccessUrls.get(mailRecipient.getId());
			if (documentAccessUrl != null) {
				esignEmailService.sendCompleteEmailsToRecipient(envelope, mailRecipient, documentAccessUrl);
			}
		});

		esignEmailService.sendCompleteEmailToSender(envelope);
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

	private List<Recipient> getNextInLineRecipients(Optional<Long> recipientId, List<Recipient> recipientList) {
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

	private Recipient prepareRecipientMetadata(Recipient recipient) {
		RecipientUpdateDto recipientUpdateDto = new RecipientUpdateDto();
		// Keep email status as not-sent during preparation; it will be set to SENT
		// in sendEnvelopeToRecipientEmail after the email is actually dispatched.
		recipientUpdateDto.setEmailStatus(EmailStatus.EMPTY);
		return setUpdatedRecipient(recipient, recipientUpdateDto);
	}

	private Recipient sendEnvelopeToRecipientEmail(Recipient recipient, String userName, String userEmail,
			String memberRole, String documentAccessUrl, EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		log.info("sendEnvelopeToRecipientEmail: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userName, epEsignEmailDataDto.getEnvelopeId(), epEsignEmailDataDto.getEnvelopeSubject(),
				epEsignEmailDataDto.getEnvelopeMessage(), epEsignEmailDataDto.getDocumentNames(), null, null, null,
				documentAccessUrl, recipient.getEnvelope().getOwner().getName(),
				recipient.getEnvelope().getOwner().getEmail());

		RecipientUpdateDto recipientUpdateDto = new RecipientUpdateDto();

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			// Handle CC recipient email
			epEsignEnvelopeRecipientEmailDynamicFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_CC_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

			recipientUpdateDto = initializerecipientDtoData(null, null, null, EmailStatus.SENT);
		}
		else {
			epEsignEnvelopeRecipientEmailDynamicFields
				.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

			if (epEsignEmailDataDto.getReminderDays() != null) {
				handleReminderScheduling(epEsignEnvelopeRecipientEmailDynamicFields, epEsignEmailDataDto, userEmail,
						recipientUpdateDto);
			}
			recipientUpdateDto.setEmailStatus(EmailStatus.SENT);
		}

		log.info("sendEnvelopeToRecipientEmail: execution ended");

		// Update recipient based on provided parameters
		return setUpdatedRecipient(recipient, recipientUpdateDto);

	}

	private void handleReminderScheduling(EpEsignEnvelopeRecipientEmailDynamicFields emailFields,
			EpEsignEmailEnvelopeDataDto emailDataDto, String userEmail, RecipientUpdateDto recipientUpdateDto) {
		// Calculate Unix timestamp for scheduling
		long initialUnixTimestamp = Instant.now().getEpochSecond();

		int emailCount = EpCommonConstants.SENDGRID_EMAIL_SCHEDULE_MAX_HOURS / EpCommonConstants.HOURS_A_DAY;
		int scheduledEmailCount = 1;

		// Obtain SendGrid batch ID for tracking scheduled emails
		String obtainedBatchId = epEmailService.obtainSendGridBatchId();
		emailFields.setBatchId(obtainedBatchId);

		int reminderCount = emailDataDto.getReminderDays() == 1 ? emailCount : 1;

		while (reminderCount >= scheduledEmailCount) {
			// Calculate send time for the scheduled reminder
			long sendAt = (reminderCount != 1)
					? initialUnixTimestamp + ChronoUnit.DAYS.getDuration().getSeconds() * scheduledEmailCount
					: initialUnixTimestamp
							+ ChronoUnit.DAYS.getDuration().getSeconds() * emailDataDto.getReminderDays();

			emailFields.setSendAt(sendAt);

			// Send scheduled reminder email
			emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
					EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL, emailFields, userEmail);

			scheduledEmailCount++;
		}

		// Update recipient DTO with batch ID and scheduled status
		recipientUpdateDto.setReminderBatchId(obtainedBatchId);
		recipientUpdateDto.setReminderStatus(EmailReminderStatus.SCHEDULED);
	}

	@Override
	public ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto) {
		log.info("updateRecipient: execution started");

		Optional<Recipient> optionalUpdatableRecipient = recipientDao.findById(recipientId);

		if (optionalUpdatableRecipient.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND);
		}

		Recipient updatableRecipient = optionalUpdatableRecipient.get();

		updatableRecipient = setUpdatedRecipient(updatableRecipient, recipientUpdateDto);

		Recipient updatedRecipient = recipientDao.save(updatableRecipient);
		RecipientDetailResponseDto responseDto = eSignMapper.recipientToRecipientDetailDto(updatedRecipient);

		log.info("updateRecipient: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	public Recipient setUpdatedRecipient(Recipient recipient, RecipientUpdateDto recipientUpdateDto) {
		log.info("setUpdatedRecipient: execution started");

		if (recipientUpdateDto.getReminderBatchId() != null) {
			recipient.setReminderBatchId(recipientUpdateDto.getReminderBatchId());
		}

		if (recipientUpdateDto.getReminderStatus() != null) {
			recipient.setReminderStatus(recipientUpdateDto.getReminderStatus());
		}

		if (recipientUpdateDto.getEmailStatus() != null) {
			recipient.setEmailStatus(recipientUpdateDto.getEmailStatus());
		}

		log.info("setUpdatedRecipient: execution end");

		return recipient;
	}

	/**
	 * @param recipientId
	 * @param envelopeId
	 * @return This method cancels any scheduled reminders to Signers If any reminders are
	 * set, upon signer approving or declining the document before the next reminder is
	 * sent.
	 */
	@Override
	public ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId) {
		log.info("cancelEmailReminders: execution started");

		Optional<Recipient> recipientOptional = recipientDao.findByIdAndEnvelopeId(recipientId, envelopeId);

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

		Optional<List<Recipient>> optionalRecipientList = recipientDao.findByEnvelopeIdAndEmailStatus(envelopeId,
				EmailStatus.SENT);

		// If no recipients found for the given Document Id, return an empty response
		if (optionalRecipientList.isPresent() && !optionalRecipientList.get().isEmpty()) {

			List<Recipient> recipientList = optionalRecipientList.get();

			Envelope envelope = recipientList.getFirst().getEnvelope();

			// if Declined find who declined the document
			String declinedBy;
			String voidOrDeclinedReason;
			String title;
			String senderName = envelope.getOwner().getName();
			String senderEmail = envelope.getOwner().getEmail();

			if (envelope.getStatus() == EnvelopeStatus.DECLINED) {
				Recipient declinedRecipient = obtainEnvelopeDeclinedBy(recipientList);
				declinedBy = declinedRecipient.getAddressBook().getName();
				voidOrDeclinedReason = declinedRecipient.getDeclineReason();
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
						finalEnvelope.getMessage(), documentName, voidOrDeclinedReason, declinedBy, title, null,
						senderName, senderEmail);

				sendEmailBasedOnRoleAndEnvelopeStatus(rcpt.getMemberRole(), finalEnvelope.getStatus(),
						epEsignEnvelopeRecipientEmailDynamicFields, rcpt.getAddressBook().getEmail());
			});

			// Send the mail to the Sender
			if (envelope.getStatus() == EnvelopeStatus.DECLINED) {
				String documentName = concatDocumentNames(envelope.getDocuments());

				EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
						envelope.getOwner().getName(), envelopeId, envelope.getSubject(), envelope.getMessage(),
						documentName, voidOrDeclinedReason, declinedBy, title, null, senderName, senderEmail);
				epEsignEnvelopeRecipientEmailDynamicFields
					.setButtonText(EpEmailButtonText.ESIGN_EMAIL_SENDER_BUTTON_TEXT.name());

				epEsignEnvelopeRecipientEmailDynamicFields
					.setDocumentAccessUrl(esignEmailService.getDocumentAccessUrlForSender(envelope));

				sendEmailBasedOnRoleAndEnvelopeStatus(null, envelope.getStatus(),
						epEsignEnvelopeRecipientEmailDynamicFields, envelope.getOwner().getEmail());
			}

			envelopeDetailedResponseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope);

		}

		log.info("sendEnvelopeInvalidEmail: execution ended");
		return new ResponseEntityDto(false, envelopeDetailedResponseDto);
	}

	@Override
	public ResponseEntityDto updateRecipientConsent(boolean isConsent) {
		Recipient recipient = documentLinkService.getDocumentLinkFromToken().getRecipientId();

		if (recipient.getStatus() != RecipientStatus.NEED_TO_SIGN) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CONSENT_PROHIBITED);
		}

		recipient.setConsent(isConsent);
		recipientDao.save(recipient);
		return new ResponseEntityDto(false, "Recipient Consent Updated");
	}

	@Override
	public ResponseEntityDto updateInternalRecipientConsent(Long recipientId, boolean isConsent) {
		User currentUser = userService.getCurrentUser();

		Recipient recipient = recipientDao.findById(recipientId)
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND));

		User internalUser = recipient.getAddressBook().getInternalUser();
		if (internalUser == null || !Objects.equals(internalUser.getUserId(), currentUser.getUserId())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		if (recipient.getStatus() != RecipientStatus.NEED_TO_SIGN) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_CONSENT_PROHIBITED);
		}

		recipient.setConsent(isConsent);
		recipientDao.save(recipient);
		return new ResponseEntityDto(false, "Recipient Consent Updated");
	}

	@Override
	public ResponseEntityDto sendNudgeEmail(Long recipientId) {
		log.info("sendReminderEmail: Sending reminder email to recipient with ID {}", recipientId);

		Optional<Recipient> recipientOptional = recipientDao.findById(recipientId);
		if (recipientOptional.isEmpty()) {
			log.error("sendReminderEmail: Recipient with ID {} not found", recipientId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND);
		}

		Recipient recipient = recipientOptional.get();

		if (recipient.getStatus() != RecipientStatus.NEED_TO_SIGN) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NUDGE_PROHIBITED);
		}

		String documentLinkUrl = documentLinkService.getDocumentAccessUrlForNudge(recipient.getEnvelope(), recipient);
		if (documentLinkUrl == null) {
			log.error("sendNudgeEmail: Document link URL not found for recipient with ID {}", recipientId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_DOCUMENT_LINK_NOT_FOUND);
		}

		esignEmailService.sendNudgeEmail(recipient, documentLinkUrl);

		// esignNotificationService.notifyRecipientOnReminder(recipient);

		log.info("sendReminderEmail: Reminder email sent successfully to recipient with ID {}", recipientId);
		return new ResponseEntityDto(false, "Reminder email sent successfully");
	}

	@Transactional
	@Override
	public ResponseEntityDto voidAllRecipientsByEnvelopeId(Long envelopeId) {

		Optional<List<Recipient>> recipientListOptional = recipientDao.findByEnvelopeId(envelopeId);

		if (recipientListOptional.isEmpty() || recipientListOptional.get().isEmpty()) {
			log.info("No recipients found for envelope ID {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOUND_IN_ENVELOP);
		}

		List<Recipient> recipients = recipientListOptional.get();

		recipients.forEach(recipient -> {
			recipient.setStatus(RecipientStatus.EMPTY);
			if (recipient.getEmailStatus() != null && recipient.getEmailStatus().equals(EmailStatus.SENT)) {
				recipient.setInboxStatus(InboxStatus.VOID);
			}
		});

		recipientDao.saveAll(recipients);

		log.info("All recipients for envelope ID {} have been voided.", envelopeId);
		return new ResponseEntityDto(false, "All recipients voided successfully");
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
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_NO_BUTTON_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_NO_BUTTON_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_DECLINED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;
				}
			}
			else {
				// Send email to the Sender
				switch (envelopeStatus) {
					case EnvelopeStatus.VOIDED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_SENDER_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_SENDER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_SENDER_TEMPLATE_V1,
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
	private Recipient obtainEnvelopeDeclinedBy(List<Recipient> recipients) {

		Optional<Recipient> declinedRecipient = recipients.stream()
			.filter(recpt -> recpt.getStatus() == RecipientStatus.DECLINED)
			.findFirst();

		if (declinedRecipient.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_DECLINED_RECIPIENT_FOUND);
		}

		return declinedRecipient.get();
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
