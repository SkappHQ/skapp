package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealUpdateStageRequestDto {

	private Long dealId;

	private Long previousStageId;

	private Long newStageId;

}
