package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;
import org.openapitools.jackson.nullable.JsonNullable;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskEditRequestDto {

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private JsonNullable<String> notes = JsonNullable.undefined();

	private Long ownerId;

	private JsonNullable<Long> contactId = JsonNullable.undefined();

	private JsonNullable<Long> dealId = JsonNullable.undefined();

}
