package com.skapp.enterprise.esignature.repository.projection;

import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class EnvelopeInboxData {

	private Long envelopeId;

	private String subject;

	private String ownerEmail;

	private RecipientStatus status;

	private LocalDateTime expiresAt;

	private LocalDateTime receivedDate;

	private String ownerProfilePic;

}
