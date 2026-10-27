package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
public class CrmActivityFeedRowResponseDto {

	private Long id;

	private CrmActivityType type;

	private String title;

	private Instant dueAt;

	private Instant loggedAt;

	private Instant startAt;

	private Instant completedAt;

	private Boolean isCompleted;

	private CrmActivityTaskPriority priority;

	private Long ownerId;

	private Long dealId;

	private Long companyId;

	private Set<Long> contactIds = new LinkedHashSet<>();

}
