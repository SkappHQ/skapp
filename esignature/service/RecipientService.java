package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

public interface RecipientService {

	ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId);

}
