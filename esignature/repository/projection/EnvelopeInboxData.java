package com.skapp.enterprise.esignature.repository.projection;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EnvelopeInboxData {

	private String subject;

	private String ownerEmail;

	private EnvelopeStatus status;

	private LocalDateTime expiresAt;

	private LocalDateTime receivedDate;

	public EnvelopeInboxData(String subject, String ownerEmail, EnvelopeStatus status, LocalDateTime expiresAt,
			LocalDateTime receivedDate) {
		this.subject = subject;
		this.ownerEmail = ownerEmail;
		this.status = status;
		this.expiresAt = expiresAt;
		this.receivedDate = receivedDate;
	}

}
