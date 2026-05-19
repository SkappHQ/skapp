package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmContactMetricsResponseDto {

	private Double totalRevenue;

	private Double revenueOnPipeline;

	private Long activeDealsCount;

	private Long openTasksCount;

	private Long overdueTasksCount;

}
