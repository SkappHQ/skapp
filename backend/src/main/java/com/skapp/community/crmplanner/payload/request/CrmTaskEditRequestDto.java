package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskEditRequestDto {

	private String name;

	private Long typeId;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private String notes;

	private Long ownerId;

	private Long contactId;

	private Long companyId;

	private Long dealId;

}
