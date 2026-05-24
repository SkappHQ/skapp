package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmDealResponseDto {

	private Long id;

	private String name;

	private String description;

	private Long stageId;

	private String stageName;

	private CrmDealPriority priority;

	private LocalDateTime closingAt;

	private String amount;

	private Long companyId;

	private String companyName;

	private Long contactId;

	private String contactName;

	private Long ownerId;

	private String ownerName;

}
