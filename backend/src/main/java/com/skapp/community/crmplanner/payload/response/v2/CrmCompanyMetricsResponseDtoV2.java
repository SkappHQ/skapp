package com.skapp.community.crmplanner.payload.response.v2;

import com.skapp.community.crmplanner.type.CrmCompanyMetrics;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CrmCompanyMetricsResponseDtoV2 {

	private Long id;

	private String name;

	private Long industryId;

	private String website;

	private String address;

	private String contactNumber;

	private CrmCompanyMetrics metrics;

}
