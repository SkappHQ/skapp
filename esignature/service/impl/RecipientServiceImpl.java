package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.email.EpEsignEmailEnvelopeDataDto;
import com.skapp.enterprise.esignature.payload.email.EpEsignEnvelopeRecipientEmailDynamicFields;
import com.skapp.enterprise.esignature.repository.RecipientRepository;
import com.skapp.enterprise.esignature.service.RecipientService;
import com.skapp.enterprise.esignature.type.MemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
			sendEnvelopToRecipientEmail(recipient.getAddressBook().getName(), recipient.getAddressBook().getEmail(),
					recipient.getMemberRole().toString(), epEsignEmailDataDto);
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

	private void sendEnvelopToRecipientEmail(String userName, String userEmail, String memberRole,
			EpEsignEmailEnvelopeDataDto epEsignEmailDataDto) {

		EpEsignEnvelopeRecipientEmailDynamicFields epEsignEnvelopeRecipientEmailDynamicFields = new EpEsignEnvelopeRecipientEmailDynamicFields();
		epEsignEnvelopeRecipientEmailDynamicFields.setRecipientName(userName);
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopId(epEsignEmailDataDto.getEnvelopeId());
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeSubject(epEsignEmailDataDto.getEnvelopeSubject());
		epEsignEnvelopeRecipientEmailDynamicFields.setEnvelopeMessage(epEsignEmailDataDto.getEnvelopeMessage());
		epEsignEnvelopeRecipientEmailDynamicFields.setSender(userService.getCurrentUser().getEmployee().getFirstName()
				+ " " + userService.getCurrentUser().getEmployee().getLastName());
		epEsignEnvelopeRecipientEmailDynamicFields.setSenderEmail(userService.getCurrentUser().getEmail());
		epEsignEnvelopeRecipientEmailDynamicFields.setDocumentNames(epEsignEmailDataDto.getDocumentNames());

		if ((MemberRole.CC).toString().equalsIgnoreCase(memberRole)) {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
		}
		else {
			emailService.sendEmail(EmailBodyTemplates.ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL,
					epEsignEnvelopeRecipientEmailDynamicFields, userEmail);
		}
	}

}
