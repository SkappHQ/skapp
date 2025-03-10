package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.model.Recipient;

import java.util.List;
import java.util.Optional;

public interface RecipientService {

	ResponseEntityDto sendEmailToRecipient(Long recipientId, Long envelopeId);

	ResponseEntityDto sendEmailToNextRecipients(List<Recipient> nextRecipientList);

	List<Recipient> getNextSignRecipientData(Optional<Long> recipientId, Long envelopeId);

}
