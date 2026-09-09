package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmCompanyCreateDto {

	private String name;

	private CrmIndustry industry;

	/**
	 * Explicit crm_industry reference. Takes precedence over the legacy industry enum
	 * when both are supplied, which is how the industry dropdown submits its selection.
	 */
	private Long industryId;

	private String website;

	private String address;

	private String contactNumber;

}
