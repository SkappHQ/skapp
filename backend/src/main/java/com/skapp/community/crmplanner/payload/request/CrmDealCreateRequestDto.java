package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealCreateRequestDto {

	private String name;

	private Long stageId;

	private Long priorityId;

	private LocalDateTime closingAt;

	private String amount;

	private Long companyId;

	private Long contactId;

	private Long ownerId;

}
