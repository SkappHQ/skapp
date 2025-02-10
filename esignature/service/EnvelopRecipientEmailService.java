package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.EnvelopeDetailedResponseDto;

public interface EnvelopRecipientEmailService {

	void sendEnvelopToRecipientEmail(String userName, String userEmail, String memberRole,
			EnvelopeDetailedResponseDto envelopeDetailedResponseDto);

}
