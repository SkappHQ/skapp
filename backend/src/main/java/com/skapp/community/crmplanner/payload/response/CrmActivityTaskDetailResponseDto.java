package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityTaskDetailResponseDto {

	private Long id;

	private String name;

	private CrmActivityTaskPriority priority;

	private Instant dueAt;

	private Boolean isCompleted;

	private Instant completedAt;

	private String notes;

	private Long ownerId;

	private CrmContactLookupResponseDto contact;

	private CrmDealResponseDto deal;

	private CrmCompanyLookupResponseDto company;

}
