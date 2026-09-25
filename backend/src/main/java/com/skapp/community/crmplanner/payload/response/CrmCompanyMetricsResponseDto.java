package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmCompanyMetrics;
import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmCompanyMetricsResponseDto {

	private Long id;

	private String name;

	private CrmIndustry industry;

	private String website;

	private String address;

	private String contactNumber;

	private CrmCompanyMetrics metrics;

}
