package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyEditDto {

	private String name;

	private CrmIndustry industry;

	private String website;

	private String address;

	private String contactNumber;

}
