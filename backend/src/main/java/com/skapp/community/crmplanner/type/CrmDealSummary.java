package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CrmDealSummary {

	private final Long contactId;

	private final BigDecimal totalClosedValue;

	private final Long closedDealCount;

}
