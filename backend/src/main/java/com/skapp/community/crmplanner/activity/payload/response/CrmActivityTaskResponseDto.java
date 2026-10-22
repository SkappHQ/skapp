package com.skapp.community.crmplanner.activity.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityTaskResponseDto {

	private Long id;

	private String name;

	private CrmActivityTaskPriority priority;

	private Boolean isCompleted;

	private Instant completedAt;

	private Instant dueAt;

	private Instant lastModifiedDate;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private Long companyId;

	private Long dealId;

}
