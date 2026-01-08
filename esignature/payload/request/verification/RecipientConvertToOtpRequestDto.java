package com.skapp.enterprise.esignature.payload.request.verification;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipientConvertToOtpRequestDto {

	private Long documentId;

	private Long recipientId;

}
