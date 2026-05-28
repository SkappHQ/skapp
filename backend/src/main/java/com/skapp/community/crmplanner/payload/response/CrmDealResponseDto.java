package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrmDealResponseDto {

	private Long id;

	private String name;

	private String stageName;

	private String stageColor;

	private String amount;

	private String companyName;

	private String contactName;

	private String ownerName;

}
