package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmContactListItemDto {

	private Long id;

	private String name;

	private String email;

	private String contactNumber;

	private LocalDateTime lastContactedAt;

	private LocalDateTime lastModifiedDate;

	private CrmCompanyLookupResponseDto company;

	private CrmContactOwnerResponseDto owner;

	// Aggregate fields for list view only
	private Double closedDealValue;

	private Long closedDealCount;

	private Double pipelineDealValue;

	private Long activeDealCount;

	private Long openTaskCount;

	private Long overdueTaskCount;

}
