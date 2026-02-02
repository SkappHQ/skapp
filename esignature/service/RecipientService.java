package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Document;
import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;
import com.skapp.enterprise.esignature.type.SignType;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface RecipientService {

	DocumentLinksAndRecipientsData prepareDocumentFirstRecipients(List<Recipient> recipients, SignType signType);

	DocumentLinksAndRecipientsData prepareNextRecipients(List<Recipient> nextRecipientList, Document document);

	List<Recipient> getNextSignRecipientData(Optional<Long> recipientId, Long envelopeId);

	void sendDocumentCompletedEmailNotifications(Envelope envelope, Map<Long, String> recipientAccessUrls);

	void sendEnvelopeEmailNotifications(Envelope envelope, Map<Long, String> recipientAccessUrls);

	ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto);

	ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId);

	ResponseEntityDto sendEmailWhenDocumentIsVoidedOrDeclined(Long envelopeId);

	ResponseEntityDto updateRecipientConsent(boolean isConsent);

	ResponseEntityDto sendNudgeEmail(Long recipientId);

	ResponseEntityDto voidAllRecipientsByEnvelopeId(Long envelopeId);

	ResponseEntityDto updateInternalRecipientConsent(Long recipientId, boolean isConsent);

	record DocumentLinksAndRecipientsData(List<DocumentLink> documentLinkList, List<Recipient> recipientList,
			Map<Long, String> recipientAccessUrls) {
	}

}
