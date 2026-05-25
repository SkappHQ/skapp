package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.enterprise.common.config.TrimmingStringDeserializer;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import tools.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
public class CrmDealCreateRequestDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	private String description;

	private Long stageId;

	private CrmDealPriority priority;

	private LocalDateTime closingAt;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String amount;

	private Long companyId;

	private Long contactId;

	private Long ownerId;

}
