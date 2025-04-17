package com.skapp.enterprise.esignature.repository.projection;

import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class EnvelopeInboxData {

	private Long envelopeId;

	private String subject;

	private String ownerEmail;

	private RecipientStatus status;

	private LocalDateTime expiresAt;

	private LocalDateTime receivedDate;

	private String ownerProfilePic;

	private List<RecipientResponseDto> recipients = new ArrayList<>();

}
