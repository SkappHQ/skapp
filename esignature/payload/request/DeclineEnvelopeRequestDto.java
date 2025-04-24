package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeclineEnvelopeRequestDto {

	@NotBlank(message = "{validation.field.voidReason.notblank}")
	private String declineReason;

}
