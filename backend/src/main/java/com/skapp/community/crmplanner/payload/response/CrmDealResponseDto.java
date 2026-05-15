package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealResponseDto {

	private Long id;

	private String name;

	private Long stageId;

	private String stageName;

	private Long priorityId;

	private String priorityName;

	private LocalDateTime closingAt;

	private String amount;

	private Long companyId;

	private String companyName;

	private Long contactId;

	private String contactName;

	private Long ownerId;

	private String ownerName;

}
