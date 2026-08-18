package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmCompanyMetrics;
import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmCompanyMetricsResponseDtoV2 {

	private Long id;

	private String name;

	private CrmIndustry industry;

	private String website;

	private String address;

	private String contactNumber;

	private CrmCompanyMetrics metrics;

}
