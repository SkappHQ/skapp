package com.skapp.community.crmplanner.activity.type;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class CrmActivityFeedRecord {

	private final CrmActivityType type;

	private final Long id;

	private final String subject;

	private final Long ownerId;

	private final String ownerFirstName;

	private final String ownerLastName;

	private final String ownerAuthPic;

	private final Long contactId;

	private final String contactName;

	private final Boolean contactDeleted;

	private final Long dealId;

	private final String dealName;

	private final Boolean dealDeleted;

	private final Long dealOwnerId;

	private final Long companyId;

	private final String companyName;

	private final Boolean companyDeleted;

	private final CrmActivityTaskPriority priority;

	private final Boolean isCompleted;

	private final Instant dueAt;

	private final Instant completedAt;

	private final Instant occurredAt;

	private final Instant createdDate;

}
