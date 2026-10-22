package com.skapp.community.crmplanner.activity.type;

import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;

import java.time.Instant;

public record CrmActivityFeedRecord(CrmActivityType type, Long id, String subject, Long ownerId, String ownerFirstName,
		String ownerLastName, String ownerAuthPic, Long contactId, String contactName, Boolean contactDeleted,
		Long dealId, String dealName, Boolean dealDeleted, Long dealOwnerId, Long companyId, String companyName,
		Boolean companyDeleted, CrmActivityTaskPriority priority, Boolean isCompleted, Boolean isScheduled,
		Instant dueAt, Instant completedAt, Instant occurredAt, Instant createdDate) {

}
