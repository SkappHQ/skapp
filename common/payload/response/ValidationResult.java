package com.skapp.enterprise.common.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ValidationResult {

	private Boolean isValid;

	private String messageKey;

}
