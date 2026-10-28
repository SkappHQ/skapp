package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmActivityCallDealResponseDto {

	private Long id;

	private String name;

	private String amount;

	private Long stageId;

	private Long ownerId;

	private Boolean isDeleted;

}
