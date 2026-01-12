package com.skapp.enterprise.esignature.payload.request.verification;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipientConvertToOtpRequestDto {

	@NotNull
	private Long documentId;

	@NotNull
	private Long recipientId;

}
