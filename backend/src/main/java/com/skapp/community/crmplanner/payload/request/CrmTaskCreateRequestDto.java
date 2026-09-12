package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmTaskCreateRequestDto {

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Instant dueAt;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private Long dealId;

}
