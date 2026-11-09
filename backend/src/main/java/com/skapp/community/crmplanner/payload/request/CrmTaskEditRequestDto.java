package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmTaskEditRequestDto {

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private Instant dueAt;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private Boolean isContactRemoved;

	private Long dealId;

	private Boolean isDealRemoved;

}
