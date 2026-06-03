package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyResponseDto {

	private Long id;

	private String name;

	private String industry;

	private String website;

	private String address;

	private String contactNumber;

}
