package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactCreateRequestDto {

	private String firstName;

	private String lastName;

	private String email;

	private Long companyId;

	private String contactNumber;

	private Long ownerId;

}
