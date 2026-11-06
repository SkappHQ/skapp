package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyEditDto {

	private String name;

	private Long industryId;

	private Boolean isIndustryRemoved;

	private String industryName;

	private String website;

	private String address;

	private String contactNumber;

}
