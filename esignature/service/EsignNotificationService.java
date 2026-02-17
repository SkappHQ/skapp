package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;

public interface EsignNotificationService {

	void notifyEnvelopeOwnerOnDocumentCompleted(Envelope envelope, Recipient recipient);

	void notifyRecipientOnSignRequest(Recipient recipient, String documentId, String envelopeId);

	void notifyRecipientOnReminder(Recipient recipient);

	void notifyRecipientsOnExpirationReminder(Envelope envelope);

	void notifyOnEnvelopeDeclined(Envelope envelope, Recipient decliningRecipient);

	void notifyOnEnvelopeVoided(Envelope envelope);

}
