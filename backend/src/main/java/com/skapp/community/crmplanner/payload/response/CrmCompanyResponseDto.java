package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmCompanyResponseDto {

	private Long id;

	private String name;

	private CrmIndustry industry;

	/**
	 * The crm_industry reference. Added alongside the legacy enum rather than replacing
	 * it, so existing consumers of this response keep working while the industry dropdown
	 * has the id it needs to preselect the saved value.
	 */
	private Long industryId;

	private String website;

	private String address;

	private String contactNumber;

}
