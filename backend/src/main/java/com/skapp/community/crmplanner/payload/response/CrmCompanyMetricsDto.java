package com.skapp.community.crmplanner.payload.response;

import java.math.BigDecimal;

import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Setter
@AllArgsConstructor
public class CrmCompanyMetricsDto {

	private Long id;

	private String name;

	private String contactNumber;

	private String industry;

	private String website;

	private String address;

	private Long tasks;

	private Long overdue;

	private BigDecimal openValue;

	private BigDecimal accountValue;

	private Long closedDeals;

	private Long openDeals;

}
