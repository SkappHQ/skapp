package com.skapp.enterprise.esignature.payload.request;

import com.skapp.enterprise.esignature.type.EnvelopeStatus;
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

	@NotBlank(message = "{not_blank.envelope.name}")
	private String name;

	private EnvelopeStatus status;

	@NotBlank(message = "{not_blank.envelope.message}")
	private String message;

	@NotBlank(message = "{not_blank.envelope.subject}")
	private String subject;

	@NotNull(message = "{notnull.envelope.expireAt}")
	private LocalDateTime expireAt;

	@NotEmpty(message = "{not_empty.envelope.documentIds}")
	private List<Long> documentIds;

	@NotEmpty(message = "{not_empty.envelope.recipients}")
	private List<RecipientDto> recipients;

}
