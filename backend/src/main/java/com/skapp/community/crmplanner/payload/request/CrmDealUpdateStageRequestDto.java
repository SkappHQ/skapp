package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealUpdateStageRequestDto {

	private Long dealId;

	private Long newStageId;

	private Long previousDealId;

	private Long nextDealId;

}
