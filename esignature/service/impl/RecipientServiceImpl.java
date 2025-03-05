package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.payload.response.RecipientDetailResponseDto;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.*;
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

	private final UserService userService;

	@Override
	public ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId) {

		return findNextRecipientAndSendEmail(Optional.ofNullable(recipientId), envelopeId);

	}

	@Override
	public ResponseEntityDto updateRecipient(Long recipientId, Recipient recipient) {

		log.info("updateRecipient: execution started");

		Optional<Recipient> recipientOptional = recipientRepository.findByIdAndEnvelopeId(recipientId,
				recipient.getEnvelope().getId());

		if (recipientOptional.isEmpty()) {
			log.info("updateRecipient: recipient ID {} for envelop ID {} not found", recipientId,
					recipient.getEnvelope().getId());
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ENVELOPE_MISMATCH);
		}

		Recipient updatableRecipient = recipientOptional.get();
		boolean isUpdatable = false;

		if (recipient.getReminderBatchId() != null) {
			updatableRecipient.setReminderBatchId(recipient.getReminderBatchId());
			isUpdatable = true;
		}

		if (recipient.getReminderStatus() != null) {
			updatableRecipient.setReminderStatus(recipient.getReminderStatus());
			isUpdatable = true;
		}

		if (recipient.getEmailStatus() != null) {
			updatableRecipient.setEmailStatus(recipient.getEmailStatus());
			isUpdatable = true;
		}

		if (isUpdatable) {
			Recipient updatedRecipient = recipientRepository.save(updatableRecipient);
			RecipientDetailResponseDto responseDto = eSignMapper.recipientToRecipientDetailDto(updatedRecipient);
			return new ResponseEntityDto(false, responseDto);
		}
		log.info("updateRecipient: execution ended");
		return new ResponseEntityDto(true, recipient);
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

		if (recipientOptional.isEmpty()) {
			log.info("cancelEmailReminders: recipient ID {} for envelop ID {} not found", recipientId, envelopeId);
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ENVELOPE_MISMATCH);
		}

		Recipient recipient = recipientOptional.get();

		if (recipient.getReminderBatchId() != null && MemberRole.SIGNER == recipient.getMemberRole()) {
			emailService.cancelScheduledEmail(recipient.getReminderBatchId(),
					EpCommonConstants.SENDGRID_CANCEL_SCHEDULED_MAIL);

			recipient.setReminderStatus(EmailReminderStatus.CANCELLED);

			ResponseEntityDto updatedRecipient = updateRecipient(recipientId, recipient);
			return updatedRecipient;

		}

		log.info("cancelEmailReminders: execution ended");

		return new ResponseEntityDto(true, eSignMapper.recipientToRecipientDetailDto(recipient));
	}

	/**
	 * @param envelopeId
	 * @return This method sends email to signers/cc/sender if the document id voided or
	 * declined by any of the receivers.
	 */
	@Override
	public ResponseEntityDto sendEnvelopeInvalidEmail(Long envelopeId) {

		log.info("sendEnvelopeInvalidEmail: execution started");

		Optional<List<Recipient>> recipientOptional = recipientRepository.findByEnvelopeId(envelopeId);

		if (recipientOptional.isEmpty()) {
			log.info("sendEnvelopeInvalidEmail: recipients for envelop ID {} not found", envelopeId);
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_NO_RECIPIENTS_FOR_ENVELOPE);
		}

		List<Recipient> recipientList = recipientOptional.get();

		Envelope envelope = recipientList.getFirst().getEnvelope();

		// if Declined find who declined the document
		String declinedBy;
		String voidOrDeclinedReason;
		if (envelope.getStatus() == EnvelopeStatus.DECLINED) {
			declinedBy = obtainEnvelopeDeclinedBy(recipientList);
			voidOrDeclinedReason = envelope.getVoidDeclineReason();
		}
		else if (envelope.getStatus() == EnvelopeStatus.VOIDED) {
			declinedBy = null;
			voidOrDeclinedReason = envelope.getVoidDeclineReason();
		}
		else {
			declinedBy = null;
			voidOrDeclinedReason = null;
		}

		// for each recipient that email has already been sent, send the status update
		// email.
		recipientList.stream().filter(recpt -> recpt.getEmailStatus() == EmailStatus.SENT).forEach(rcpt -> {

			// If any Reminders are been scheduled about the initial state of the
			// document, cancel them
			if (rcpt.getReminderBatchId() != null && rcpt.getReminderStatus() == EmailReminderStatus.SCHEDULED) {
				cancelEmailReminders(rcpt.getId(), envelope.getId());
			}

			String documentName = concatDocumentNames(rcpt.getEnvelope().getDocuments());

			EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
					rcpt.getAddressBook().getName(), rcpt.getEnvelope().getId(), envelope.getSubject(),
					envelope.getMessage(), documentName, voidOrDeclinedReason, declinedBy);

			sendEmailBasedOnRoleAndEnvelopeStatus(rcpt.getMemberRole(), envelope.getStatus(),
					epEsignEnvelopeRecipientEmailDynamicFields, rcpt.getAddressBook().getEmail());
		});

		// Send the mail to the Sender
		String documentName = concatDocumentNames(envelope.getDocuments());

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userService.getCurrentUser().getEmployee().getFirstName() + " "
						+ userService.getCurrentUser().getEmployee().getLastName(),
				envelopeId, envelope.getSubject(), envelope.getMessage(), documentName, voidOrDeclinedReason,
				declinedBy);
		sendEmailBasedOnRoleAndEnvelopeStatus(null, envelope.getStatus(), epEsignEnvelopeRecipientEmailDynamicFields,
				userService.getCurrentUser().getEmail());

		log.info("sendEnvelopeInvalidEmail: execution ended");
		return new ResponseEntityDto(false, eSignMapper.envelopeToEnvelopeDetailedResponseDto(envelope));
	}

	/**
	 *
	 * @param recipientId - This indicates the current active recipientID or rather the active recipient that the email already sent.
	 * @param envelopeId - This indicates the envelopeID
	 * @return
	 * This method finds and sends the document emails to the recipients based on the signing order and role.
	 * If the recipientID is not provided, the very first recipient in the signing order will be picked for the
	 * provided envelopeID to send the email.
	 * If the recipientID is provided, the next in line recipient in the signing order is picked for the envelopeID
	 * to send the email.
	 */
	private ResponseEntityDto findNextRecipientAndSendEmail(Optional<Long> recipientId, Long envelopeId) {

		log.info("findNextRecipient: execution started");

		Optional<List<Recipient>> recipientListOptional = recipientRepository.findByEnvelopeId(envelopeId);

		// If no recipients found for the given Document Id, return an empty response
		if (recipientListOptional.isEmpty()) {
			log.info("findNextRecipient: next recipient for envelop ID {} not found", envelopeId);
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ENVELOPE_MISMATCH);
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

			int currentSigningOrderId = recipientList.stream()
				.filter(recipient -> recipient.getId().compareTo(recipientId.get()) == 0)
				.findFirst()
				.get()
				.getSigningOrder();

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
			log.info("findNextRecipient: next recipient for envelop ID {} not found", envelopeId);
			return new ResponseEntityDto(false, EsignMessageConstant.ESIGN_ERROR_RECIPIENT_ENVELOPE_MISMATCH);
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

		Envelope envelopeData = nextRecipientList.getFirst().getEnvelope();

		EpEsignEmailEnvelopeDataDto epEsignEmailDataDto = eSignMapper
			.envelopeToEpEsignEmailEnvelopeDataDto(envelopeData);

		String documentName = concatDocumentNames(envelopeData.getDocuments());

		epEsignEmailDataDto.setDocumentNames(documentName);

		// After obtaining the next in line recipient, implement the email sender
		log.info("sendEnvelopToRecipientEmail: process started");

		List<Long> recipientIdList = new ArrayList<>();

		nextRecipientList.forEach(recipient -> {
			recipientIdList.add(recipient.getId());
			sendEnvelopToRecipientEmail(recipient.getId(), recipient.getAddressBook().getName(),
					recipient.getAddressBook().getEmail(), recipient.getMemberRole().toString(), epEsignEmailDataDto);
		});
		log.info("sendEnvelopToRecipientEmail: process ended");

		return new ResponseEntityDto(false, recipientIdList);
	}

	private void sendEnvelopToRecipientEmail(Long recipientId, String userName, String userEmail, String memberRole,
			EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		log.info("sendEnvelopToRecipientEmail: execution started");

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = initializeEpEsignEmailValues(
				userName, epEsignEmailDataDto.getEnvelopeId(), epEsignEmailDataDto.getEnvelopeSubject(),
				epEsignEmailDataDto.getEnvelopeMessage(), epEsignEmailDataDto.getDocumentNames(), null, null);

		Envelope envelope = new Envelope();
		envelope.setId(epEsignEmailDataDto.getEnvelopeId());

		Recipient recipient = new Recipient();
		recipient.setId(recipientId);
		recipient.setEnvelope(envelope);

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

			recipient.setEmailStatus(EmailStatus.SENT);
		}
		else {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
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
				String obtainedBatchId = emailService.obtainSendGridBatchId();
				epEsignEnvelopeRecipientEmailDynamicFields.setBatchId(obtainedBatchId);

				int reminderCount = epEsignEmailDataDto.getReminderDays() == 1 ? emailCount : 1;

				while (reminderCount >= schdeuledEmailCount) {

					 epEsignEnvelopeRecipientEmailDynamicFields.setSendAt(reminderCount
					 != 1
					 ? initialUnixTimestamp + ChronoUnit.DAYS.getDuration().getSeconds()
					 * schdeuledEmailCount
					 : initialUnixTimestamp + ChronoUnit.DAYS.getDuration().getSeconds()
					 * epEsignEmailDataDto.getReminderDays());

					emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
							epEsignEnvelopeRecipientEmailDynamicFields, userEmail);

					schdeuledEmailCount++;
				}

				// Save the scheduled email batch id for future references like cancelling
				// the schedule
				recipient.setReminderBatchId(obtainedBatchId);
				recipient.setReminderStatus(EmailReminderStatus.SCHEDULED);
				recipient.setEmailStatus(EmailStatus.SENT);
			}
		}

		log.info("sendEnvelopToRecipientEmail: execution started");
		updateRecipient(recipientId, recipient);
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
			String declinedBy) {

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = new EpEsignEnvelopeRecipientEmailDynamicFields();
		epEsignEnvelopeRecipientEmailDynamicFields.setRecipientName(userName);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopId(envelopeId);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeSubject(envelopeSubject);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeMessage(envelopeMessage);
		epEsignEnvelopeRecipientEmailDynamicFields.setSender(userService.getCurrentUser().getEmployee().getFirstName()
				+ " " + userService.getCurrentUser().getEmployee().getLastName());
		epEsignEnvelopeRecipientEmailDynamicFields.setSenderEmail(userService.getCurrentUser().getEmail());
		epEsignEnvelopeRecipientEmailDynamicFields.setDocumentNames(documentName);
		epEsignEnvelopeRecipientEmailDynamicFields.setVoidDeclineReason(voidDeclinedReason);
		epEsignEnvelopeRecipientEmailDynamicFields.setDeclinedBy(declinedBy);

		return epEsignEnvelopeRecipientEmailDynamicFields;
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
						emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_DECLINED_RECIEVER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;
				}
			}
			else {
				// Send email to the Sender
				switch (envelopeStatus) {
					case EnvelopeStatus.VOIDED:
						emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_VOIDED_SENDER_EMAIL,
								epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
						break;

					case EnvelopeStatus.DECLINED:
						emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_DECLINED_SENDER_EMAIL,
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

}
