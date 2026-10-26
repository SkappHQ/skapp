package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CrmActivityFeedRowResponseDto {

	private Long id;

	private CrmActivityType type;

	private String subject;

	private Instant dueAt;

	private Instant occurredAt;

	private Instant completedAt;

	private Boolean isCompleted = false;

	private CrmActivityTaskPriority priority;

	private Long ownerId;

	private List<CrmActivityFeedAssociationResponseDto> contacts = new ArrayList<>();

	private CrmActivityFeedAssociationResponseDto deal;

	private CrmActivityFeedAssociationResponseDto company;

	private Boolean canComplete = false;

}
