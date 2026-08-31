package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmIndustryName;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyCreateDto {

	private String name;

	private CrmIndustryName industry;

	private String website;

	private String address;

	private String contactNumber;

}
