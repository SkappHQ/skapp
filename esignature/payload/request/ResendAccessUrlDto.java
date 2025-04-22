package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResendAccessUrlDto {

	@NotNull
	private String token;

}
