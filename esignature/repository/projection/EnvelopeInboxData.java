package com.skapp.enterprise.esignature.repository.projection;

import com.skapp.enterprise.esignature.payload.response.AddressBookBasicResponseDto;
import com.skapp.enterprise.esignature.payload.response.RecipientResponseDto;
import com.skapp.enterprise.esignature.type.InboxStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class EnvelopeInboxData {

	private Long envelopeId;

	private String subject;

	private String title;

	private AddressBookBasicResponseDto sender;

	private InboxStatus status;

	private LocalDate expiresAt;

	private LocalDateTime receivedDate;

	private List<RecipientResponseDto> recipients = new ArrayList<>();

}
