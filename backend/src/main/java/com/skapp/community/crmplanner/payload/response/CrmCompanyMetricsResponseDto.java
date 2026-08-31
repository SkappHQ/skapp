package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmIndustry;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Setter
@AllArgsConstructor
public class CrmCompanyMetricsResponseDto {

	private Long id;

	private String name;

	private String contactNumber;

	private CrmIndustry industry;

	private String website;

	private String address;

	private Long openTasksCount;

	private Long overdue;

	private String openValue;

	private String accountValue;

	private Long closedDeals;

	private Long openDeals;

}
