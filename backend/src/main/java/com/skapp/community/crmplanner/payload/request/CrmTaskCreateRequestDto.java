package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import com.skapp.enterprise.common.config.TrimmingStringDeserializer;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskCreateRequestDto {

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private LocalDateTime dueAt;

	@JsonDeserialize(using = TrimmingStringDeserializer.class)
	private String notes;

	private Long ownerId;

	private Long contactId;

	private Long companyId;

	private Long dealId;

}
