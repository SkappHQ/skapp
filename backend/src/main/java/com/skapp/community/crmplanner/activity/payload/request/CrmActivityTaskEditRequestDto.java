package com.skapp.community.crmplanner.activity.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.Getter;
import lombok.Setter;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityTaskEditRequestDto {

	private String name;

	private CrmActivityTaskPriority priority;

	private Boolean isCompleted;

	private Instant dueAt;

	private JsonNullable<String> notes;

	private Long ownerId;

	private JsonNullable<Long> contactId;

	private JsonNullable<Long> dealId;

}
