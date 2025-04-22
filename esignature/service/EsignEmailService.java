package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;

public interface EsignEmailService {

	void resendEnvelopeEmailToRecipient(Envelope envelope, Recipient recipient, String documentAccessUrl);

	void sendCompleteEmailsToRecipients(Envelope envelope);

	void sendCompleteEmailToSender(Envelope envelope);

}
