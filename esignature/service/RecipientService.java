package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.RecipientUpdateDto;

public interface RecipientService {

	ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId);

	ResponseEntityDto updateRecipient(Long recipientId, RecipientUpdateDto recipientUpdateDto);

	ResponseEntityDto cancelEmailReminders(Long recipientId, Long envelopeId);

	ResponseEntityDto sendEmailWhenDocumentIsVoidedOrDeclined(Long envelopeId);

}
