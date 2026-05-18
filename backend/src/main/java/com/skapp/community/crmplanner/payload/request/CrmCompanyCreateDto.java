package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyCreateDto {

	private String name;

	private String industry;

	private String website;

	private String address;

	private String contactNumber;

}
