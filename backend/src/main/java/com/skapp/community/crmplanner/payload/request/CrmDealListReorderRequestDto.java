package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealListReorderRequestDto {

	private Long dealId;

	private Long previousDealId;

	private Long nextDealId;

}
