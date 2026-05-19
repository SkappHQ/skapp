package com.skapp.community.crmplanner.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactCreateRequestDto {

	@NotBlank
	private String name;

	@NotBlank
	private String email;

	private Long companyId;

	private String contactNumber;

	private Long ownerId;

}
