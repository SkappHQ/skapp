package com.skapp.community.crmplanner.type;

import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.model.CrmActivityCall_;
import com.skapp.community.crmplanner.model.CrmActivityMeeting_;
import com.skapp.community.crmplanner.model.CrmActivityTask_;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Selection;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;

import java.time.Instant;

public class CrmActivityFeedColumns {

	private final CrmActivityType type;

	private final Expression<Long> id;

	private final Expression<String> name;

	private final Expression<Instant> dueAt;

	private final Expression<Instant> completedAt;

	private final Expression<Boolean> isCompleted;

	private final Expression<String> priority;

	private final Expression<Long> ownerId;

	private final Expression<Long> dealId;

	private final Expression<Long> companyId;

	private final Expression<String> contactIds;

	private final Expression<Instant> startAt;

	private final Expression<Instant> loggedAt;

	private CrmActivityFeedColumns(Builder builder) {
		this.type = builder.type;
		this.id = builder.id;
		this.name = builder.name;
		this.dueAt = builder.dueAt;
		this.completedAt = builder.completedAt;
		this.isCompleted = builder.isCompleted;
		this.priority = builder.priority;
		this.ownerId = builder.ownerId;
		this.dealId = builder.dealId;
		this.companyId = builder.companyId;
		this.contactIds = builder.contactIds;
		this.startAt = builder.startAt;
		this.loggedAt = builder.loggedAt;
	}

	public static Builder builder() {
		return new Builder();
	}

	public Selection<?>[] toSelections(HibernateCriteriaBuilder cb) {
		return new Selection<?>[] { cb.literal(type.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
				id.alias(CrmActivityTask_.ID), name.alias(CrmActivityTask_.NAME),
				instantOrNull(cb, dueAt).alias(CrmActivityTask_.DUE_AT),
				instantOrNull(cb, completedAt).alias(CrmActivityTask_.COMPLETED_AT),
				booleanOrNull(cb, isCompleted).alias(CrmActivityTask_.IS_COMPLETED),
				stringOrNull(cb, priority).alias(CrmActivityTask_.PRIORITY), ownerId.alias(CrmActivityTask_.OWNER),
				dealId.alias(CrmActivityTask_.DEAL), companyId.alias(CrmActivityTask_.COMPANY),
				contactIds.alias(CrmActivityTask_.CONTACT),
				instantOrNull(cb, startAt).alias(CrmActivityMeeting_.START_AT),
				instantOrNull(cb, loggedAt).alias(CrmActivityCall_.LOGGED_AT) };
	}

	private Expression<Instant> instantOrNull(HibernateCriteriaBuilder cb, Expression<Instant> expression) {
		return expression != null ? expression : cb.nullLiteral(Instant.class);
	}

	private Expression<Boolean> booleanOrNull(HibernateCriteriaBuilder cb, Expression<Boolean> expression) {
		return expression != null ? expression : cb.nullLiteral(Boolean.class);
	}

	private Expression<String> stringOrNull(HibernateCriteriaBuilder cb, Expression<String> expression) {
		return expression != null ? expression : cb.nullLiteral(String.class);
	}

	public static class Builder {

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

		public Builder type(CrmActivityType type) {
			this.type = type;
			return this;
		}

		public Builder id(Expression<Long> id) {
			this.id = id;
			return this;
		}

		public Builder name(Expression<String> name) {
			this.name = name;
			return this;
		}

		public Builder dueAt(Expression<Instant> dueAt) {
			this.dueAt = dueAt;
			return this;
		}

		public Builder completedAt(Expression<Instant> completedAt) {
			this.completedAt = completedAt;
			return this;
		}

		public Builder isCompleted(Expression<Boolean> isCompleted) {
			this.isCompleted = isCompleted;
			return this;
		}

		public Builder priority(Expression<String> priority) {
			this.priority = priority;
			return this;
		}

		public Builder ownerId(Expression<Long> ownerId) {
			this.ownerId = ownerId;
			return this;
		}

		public Builder dealId(Expression<Long> dealId) {
			this.dealId = dealId;
			return this;
		}

		public Builder companyId(Expression<Long> companyId) {
			this.companyId = companyId;
			return this;
		}

		public Builder contactIds(Expression<String> contactIds) {
			this.contactIds = contactIds;
			return this;
		}

		public Builder startAt(Expression<Instant> startAt) {
			this.startAt = startAt;
			return this;
		}

		public Builder loggedAt(Expression<Instant> loggedAt) {
			this.loggedAt = loggedAt;
			return this;
		}

		public CrmActivityFeedColumns build() {
			return new CrmActivityFeedColumns(this);
		}

	}

}
