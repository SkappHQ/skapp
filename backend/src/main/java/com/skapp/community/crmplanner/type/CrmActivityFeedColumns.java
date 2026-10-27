package com.skapp.community.crmplanner.type;

import jakarta.persistence.criteria.Expression;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityFeedColumns {

	private CrmActivityType type;

	private Expression<Long> id;

	private Expression<String> name;

	private Expression<Instant> dueAt;

	private Expression<Instant> completedAt;

	private Expression<Boolean> isCompleted;

	private Expression<String> priority;

	private Expression<Long> ownerId;

	private Expression<Long> dealId;

	private Expression<Long> companyId;

	private Expression<String> contactIds;

	private Expression<Instant> startAt;

	private Expression<Instant> loggedAt;

}
