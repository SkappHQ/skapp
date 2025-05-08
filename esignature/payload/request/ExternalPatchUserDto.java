package com.skapp.enterprise.esignature.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExternalPatchUserDto {

	@NotBlank(message = "firstName cannot be blank")
	private String firstName;

	private String lastName;

	private String email;

	private String phone;

}
