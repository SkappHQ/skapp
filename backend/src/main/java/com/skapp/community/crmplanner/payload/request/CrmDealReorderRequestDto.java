package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealReorderRequestDto {

	private Long dealId;

	private Long prevDealId;

	private Long nextDealId;

}
