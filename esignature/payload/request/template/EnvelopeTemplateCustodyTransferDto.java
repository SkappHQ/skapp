package com.skapp.enterprise.esignature.payload.request.template;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnvelopeTemplateCustodyTransferDto {

	@NotNull(message = "{validation.template.envelope.newOwnerId.notnull}")
	private Long newOwnerId;

}
