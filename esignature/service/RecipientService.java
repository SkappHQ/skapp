package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;

import java.util.Optional;

public interface RecipientService {

	ResponseEntityDto findNextRecipientAndSendEmail(Optional<Long> recipientId, Long envelopeId);

}
