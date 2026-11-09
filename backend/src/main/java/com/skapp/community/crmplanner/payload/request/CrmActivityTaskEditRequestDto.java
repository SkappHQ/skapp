package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityTaskEditRequestDto {

	private String name;

	private CrmActivityTaskPriority priority;

	private Instant dueAt;

	private Long ownerId;

	private Long contactId;

	private Long dealId;

	private Boolean isDealRemoved;

	private Long companyId;

	private Boolean isCompanyRemoved;

	private String notes;

	private Boolean isCompleted;

}
