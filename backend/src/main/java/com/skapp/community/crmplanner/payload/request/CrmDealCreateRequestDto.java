package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealPriority;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmDealCreateRequestDto {

	private String name;

	private String description;

	private Long stageId;

	private CrmDealPriority priority;

	private Instant closingAt;

	private String amount;

	private Long contactId;

	private Long ownerId;

}
