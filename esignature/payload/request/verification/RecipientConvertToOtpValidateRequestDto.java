package com.skapp.enterprise.esignature.payload.request.verification;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipientConvertToOtpValidateRequestDto {

	private Long documentId;

	private Long recipientId;

	private String code;

}
