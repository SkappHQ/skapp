package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentFieldSignDto {

	@NotNull(message = "{validation.envelope.id.not_null}")
	private Long envelopeId;

	@NotNull(message = "{validation.document.id.not_null}")
	private Long documentId;

	@NotNull
	private FieldSignDto fieldSignDto;

	@NotNull(message = "{validation.recipient.id.not_null}")
	private Long recipientId;

}
