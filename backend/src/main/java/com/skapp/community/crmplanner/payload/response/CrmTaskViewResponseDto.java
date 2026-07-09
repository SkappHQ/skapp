package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CrmTaskViewResponseDto {

	private Long id;

	private String name;

	private CrmTaskType type;

	private CrmTaskPriority priority;

	private Boolean isCompleted;

	private LocalDateTime dueAt;

	private String notes;

	private CrmOwnerResponseDto owner;

	private CrmContactLookupResponseDto contact;

	private CrmDealDetailResponseDto deal;

}
