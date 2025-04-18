package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;

import java.util.List;
import java.util.Optional;

public interface RecipientService {

	DocumentLinksAndRecipientsData notifyDocumentFirstRecipients(List<Recipient> recipients);

	ResponseEntityDto sendEmailToNextRecipients(List<Recipient> nextRecipientList);

	List<Recipient> getNextSignRecipientData(Optional<Long> recipientId, Long envelopeId);

	ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto);

	ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId);

	ResponseEntityDto sendEmailWhenDocumentIsVoidedOrDeclined(Long envelopeId);

	ResponseEntityDto sendEmailWhenDocumentIsCompleted(Envelope envelope);

	record DocumentLinksAndRecipientsData(List<DocumentLink> documentLinkList, List<Recipient> recipientList) {
	}

	ResponseEntityDto sendNudgeEmail(Long recipientId);

}
