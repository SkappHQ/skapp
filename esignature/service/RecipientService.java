package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Recipient;

public interface RecipientService {

	ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId);

	ResponseEntityDto updateRecipient(Long recipientId, Recipient recipient);

	ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId);

	ResponseEntityDto sendEnvelopeInvalidEmail(Long envelopeId);

}
