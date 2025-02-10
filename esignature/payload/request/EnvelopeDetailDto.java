package com.skapp.enterprise.esignature.payload.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
import com.skapp.enterprise.esignature.utill.deserializer.EnvelopeStatusDeserializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EnvelopeDetailDto {

	@NotBlank(message = "{validation.envelope.name.not_blank}")
	private String name;

	@NotNull(message = "{validation.envelope.status.invalid}")
	@JsonDeserialize(using = EnvelopeStatusDeserializer.class)
	private EnvelopeStatus status;

	private String message;

	@NotBlank(message = "{validation.envelope.subject.not_blank}")
	private String subject;

	@NotNull(message = "{validation.envelope.expireAt.not_null}")
	private LocalDateTime expireAt;

	@NotEmpty(message = "{validation.envelope.documentIds.not_empty}")
	private List<Long> documentIds;

	@NotEmpty(message = "{validation.envelope.recipients.not_empty}")
	private List<RecipientDto> recipients;

}
