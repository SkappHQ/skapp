package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealResponseDto {

	private Long id;

	private String name;

	private String amount;

	private LocalDateTime closingAt;

	private CrmDealStageResponseDto stage;

	private CrmPriorityResponseDto priority;

	private CrmContactOwnerResponseDto owner;

	private CrmCompanyLookupResponseDto company;

}
