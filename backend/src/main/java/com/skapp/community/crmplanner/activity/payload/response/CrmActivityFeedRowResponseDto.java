package com.skapp.community.crmplanner.activity.payload.response;

import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
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

	private Boolean isCompleted;

	private CrmActivityTaskPriority priority;

	private CrmActivityPersonResponseDto owner;

	private List<CrmActivityLinkResponseDto> contacts;

	private CrmActivityLinkResponseDto deal;

	private CrmActivityLinkResponseDto company;

}
