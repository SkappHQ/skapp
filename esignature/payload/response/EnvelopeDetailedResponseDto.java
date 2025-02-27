package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EnvelopeDetailedResponseDto {

	private Long id;

	private String name;

	private EnvelopeStatus status;

	private String message;

	private String subject;

	private LocalDateTime sentAt;

	private LocalDateTime completedAt;

	private LocalDateTime declinedAt;

	private LocalDateTime expireAt;

	private List<DocumentDetailResponseDto> documents;

	private List<RecipientDetailResponseDto> recipients;

	private List<Object> emailResponse;

	private EnvelopeSettingResponseDto setting;

}
