package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
public class SignatureCertificateResponseDto {

	private Long id;

	private String name;

	private EnvelopeStatus status;

	private String message;

	private String subject;

	private AddressBook owner;

	private LocalDateTime sentAt;

	private LocalDateTime completedAt;

	private LocalDateTime declinedAt;

	private LocalDateTime expireAt;

	private String uuid;

	private String organizationTimeZone;

	private List<DocumentDetailResponseDto> documents;

	private List<RecipientDetailResponseDto> recipients;

	private List<AuditTrailResponseDto> auditTrails;

}
