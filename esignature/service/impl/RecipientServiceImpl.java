package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.exception.EntityNotFoundException;
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
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.request.DocumentAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;
import com.skapp.enterprise.esignature.payload.response.DocumentLinkResponseDto;
import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.repository.DocumentLinkRepository;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import com.skapp.enterprise.esignature.type.SignType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

	private final DocumentLinkRepository documentLinkRepository;

	public static final String TOKEN = "token";

	@Override
	public DocumentLinksAndRecipientsData notifyDocumentFirstRecipients(List<Recipient> recipients, SignType signType) {
		log.info("notifyRecipients: execution started");

		List<Recipient> nextRecipientList = signType.equals(SignType.SEQUENTIAL)
				? getNextInLineRecipients(Optional.empty(), recipients) : recipients;

		if (nextRecipientList.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE);
		}

		Envelope envelopeData = nextRecipientList.getFirst().getEnvelope();

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = getEpEsignEmailEnvelopeDataDto(envelopeData);

		List<DocumentLink> documentLinkList = new ArrayList<>();

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

			String documentAccessUrl = documentLinkData.accessUrl();

			documentLinkList.add(documentLinkData.documentLink());

			return sendEnvelopeToRecipientEmail(recipient, recipient.getAddressBook().getName(),
					recipient.getAddressBook().getEmail(), recipient.getMemberRole().toString(), documentAccessUrl,
					epEsignEmailDataDto);
		}).toList();

		log.info("notifyRecipients: execution end");

		return new DocumentLinksAndRecipientsData(documentLinkList, updatedRecipients);
	}

	@Override
	public ResponseEntityDto sendEmailToNextRecipients(List<Recipient> nextRecipientList) {
		if (nextRecipientList.isEmpty()) {
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE);
		}

		Envelope envelopeData = nextRecipientList.getFirst().getEnvelope();

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = getEpEsignEmailEnvelopeDataDto(envelopeData);

		// After obtaining the next in line recipient, implement the email sender
		log.info("sendEnvelopToRecipientEmail: process started");

		List<Long> recipientIdList = new ArrayList<>();

		nextRecipientList.forEach(recipient -> {
			recipientIdList.add(recipient.getId());
			DocumentPermissionType permissionType = DocumentPermissionType.WRITE;
			if (MemberRole.CC.toString().equalsIgnoreCase(recipient.getMemberRole().name())) {
				permissionType = DocumentPermissionType.READ;
			}
			DocumentAccessUrlDto documentAccessUrlDto = new DocumentAccessUrlDto(
					envelopeData.getDocuments().getFirst().getId(), recipient.getId(), permissionType);
			DocumentLinkResponseDto documentLink = documentLinkService.generateDocumentAccessUrl(documentAccessUrlDto);
			String documentAccessUrl = documentLink.getUrl();

			sendEnvelopeToRecipientEmail(recipient, recipient.getAddressBook().getName(),
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

		return getNextInLineRecipients(recipientId, recipientList);
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

	private Recipient sendEnvelopeToRecipientEmail(Recipient recipient, String userName,
			String userEmail, String memberRole, String documentAccessUrl,
			EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

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
		}

		log.info("sendEnvelopeToRecipientEmail: execution ended");

		// Update recipient based on provided parameters
        return setUpdatedRecipient(recipient, recipientUpdateDto);

    }

	private void handleReminderScheduling(EpEsignEnvelopeRecipientEmailDynamicFields emailFields,
			EpEsignEmailEnvelopeDataDto emailDataDto, String userEmail, RecipientUpdateDto recipientUpdateDto) {
		// Calculate Unix timestamp for scheduling
		Long initialUnixTimestamp = Instant.now().getEpochSecond();

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
		recipientUpdateDto.setEmailStatus(EmailStatus.SENT);
	}

	@Override
	public ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto) {
		log.info("updateRecipient: execution started");

		Optional<Recipient> optionalUpdatableRecipient = recipientRepository.findById(recipientId);

		if (optionalUpdatableRecipient.isEmpty()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NOT_FOUND);
		}

		Recipient updatableRecipient = optionalUpdatableRecipient.get();

		updatableRecipient = setUpdatedRecipient(updatableRecipient, recipientUpdateDto);

		Recipient updatedRecipient = recipientRepository.save(updatableRecipient);
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
			String senderName = envelope.getOwner().getName();
			String senderEmail = envelope.getOwner().getEmail();

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
						finalEnvelope.getMessage(), documentName, voidOrDeclinedReason, declinedBy, title, null,
						senderName, senderEmail);

				sendEmailBasedOnRoleAndEnvelopeStatus(rcpt.getMemberRole(), finalEnvelope.getStatus(),
						epEsignEnvelopeRecipientEmailDynamicFields, rcpt.getAddressBook().getEmail());
			});

			// Send the mail to the Sender
			String documentName = concatDocumentNames(envelope.getDocuments());

			EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
					userService.getCurrentUser().getEmployee().getFirstName() + " "
							+ userService.getCurrentUser().getEmployee().getLastName(),
					envelopeId, envelope.getSubject(), envelope.getMessage(), documentName, voidOrDeclinedReason,
					declinedBy, title, null, senderName, senderEmail);
			sendEmailBasedOnRoleAndEnvelopeStatus(null, envelope.getStatus(),
					epEsignEnvelopeRecipientEmailDynamicFields, userService.getCurrentUser().getEmail());

			envelopeDetailedResponseDto = eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope);

		}

		log.info("sendEnvelopeInvalidEmail: execution ended");
		return new ResponseEntityDto(false, envelopeDetailedResponseDto);
	}

	@Override
	public ResponseEntityDto updateRecipientConsent(boolean isConsent) {
		Recipient recipient = getRecipientFromToken();
		recipient.setConsent(isConsent);
		recipientRepository.save(recipient);
		return new ResponseEntityDto(false, "Recipient Consent Updated");
	}

	@Override
	public ResponseEntityDto sendNudgeEmail(Long recipientId) {
		log.info("sendReminderEmail: Sending reminder email to recipient with ID {}", recipientId);

		Optional<Recipient> recipientOptional = recipientRepository.findById(recipientId);
		if (recipientOptional.isEmpty()) {
			log.error("sendReminderEmail: Recipient with ID {} not found", recipientId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ID_NOT_FOUND);
		}

		Recipient recipient = recipientOptional.get();

		if (recipient.getStatus() != RecipientStatus.NEED_TO_SIGN) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_RECIPIENT_NUDGE_PROHIBITED);
		}

		EpEsignEnvelopeRecipientEmailDynamicFields emailFields = initializeEpEsignEmailValues(
				recipient.getAddressBook().getName(), recipient.getEnvelope().getId(),
				recipient.getEnvelope().getSubject(), recipient.getEnvelope().getMessage(),
				concatDocumentNames(recipient.getEnvelope().getDocuments()), null, null, null, null,
				recipient.getEnvelope().getOwner().getName(), recipient.getEnvelope().getOwner().getEmail());

		emailFields.setTitle(EsignEmailTitleConstant.ESIGN_ENVELOPE_RECIEVER_EMAIL_TITLE);

		emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
				EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_EMAIL_REMINDER, emailFields,
				recipient.getAddressBook().getEmail());

		log.info("sendReminderEmail: Reminder email sent successfully to recipient with ID {}", recipientId);
		return new ResponseEntityDto(false, "Reminder email sent successfully");
	}

	@Transactional
	@Override
	public ResponseEntityDto declineRecipientInEnvelope(Recipient recipient) {

		recipient.setStatus(RecipientStatus.DECLINED);
		recipientRepository.save(recipient);

		List<Recipient> envelopeRecipients = recipientRepository.findByEnvelopeId(recipient.getEnvelope().getId())
			.orElse(new ArrayList<>());

		envelopeRecipients.stream()
			.filter(recipientToUpdate -> !recipientToUpdate.getId().equals(recipient.getId()))
			.forEach(recipientToUpdate -> {
				if (recipientToUpdate.getMemberRole() == MemberRole.SIGNER
						&& recipientToUpdate.getStatus() == RecipientStatus.NEED_TO_SIGN) {
					recipientToUpdate.setStatus(RecipientStatus.EMPTY);
				}
				else if (recipientToUpdate.getMemberRole() == MemberRole.CC) {
					recipientToUpdate.setStatus(RecipientStatus.COMPLETED);
				}
				recipientRepository.save(recipientToUpdate);
			});

		// Send email notifications for the envelope
		sendEmailWhenDocumentIsVoidedOrDeclined(recipient.getEnvelope().getId());

		log.info("declineEnvelope: execution ended");
		return new ResponseEntityDto(false, "Envelope declined successfully");
	}

	@Override
	public ResponseEntityDto voidAllRecipientsByEnvelopeId(Long envelopeId) {

		Optional<List<Recipient>> recipientListOptional = recipientRepository.findByEnvelopeId(envelopeId);

		if (recipientListOptional.isEmpty() || recipientListOptional.get().isEmpty()) {
			log.info("No recipients found for envelope ID {}", envelopeId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOUND_IN_ENVELOP);
		}

		recipientListOptional.get().forEach(recipient -> {
			recipient.setStatus(RecipientStatus.VOID);
			recipientRepository.save(recipient);
		});

		log.info("All recipients for envelope ID {} have been voided.", envelopeId);
		return new ResponseEntityDto(false, "All recipients voided successfully");
	}

	@Override
	public Recipient getRecipientFromToken() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || authentication.getDetails() == null) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		try {
			if (!(authentication.getDetails() instanceof Map)) {
				throw new AuthenticationException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK_METADATA);
			}

			Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
			String token = (String) details.get(TOKEN);

			DocumentLink documentLink = documentLinkRepository.findByToken(token)
				.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_OR_EXPIRED_LINK));

			return documentLink.getRecipientId();
		}
		catch (Exception ex) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_INVALID_DOCUMENT_LINK);
		}
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
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
								EpEmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EpEmailMainTemplates.ESIGN_RECEIVER_TEMPLATE_V1,
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
