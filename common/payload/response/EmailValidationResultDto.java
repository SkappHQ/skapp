package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailValidationResultDto {

	private String email;

	private Boolean isValid;

	private String reason;

}
