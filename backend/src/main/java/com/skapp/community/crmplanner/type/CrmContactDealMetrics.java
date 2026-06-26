package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CrmContactDealMetrics {

	private final BigDecimal totalRevenue;

	private final BigDecimal pipelineRevenue;

	private final Long activeDealsCount;

}
