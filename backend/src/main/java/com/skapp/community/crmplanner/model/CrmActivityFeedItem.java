package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.time.Instant;

/**
 * Read-only view over the four activity tables so the feed can filter, order and page
 * across all of them in one query. Only the columns the feed filters and orders on live
 * here; row details are loaded per type afterwards.
 */
@Entity
@Immutable
@Getter
@NoArgsConstructor
@Subselect(CrmActivityFeedItem.FEED_SUBSELECT)
@Synchronize({ "crm_activity_task", "crm_activity_call", "crm_activity_meeting", "crm_activity_email" })
public class CrmActivityFeedItem {

	static final String FEED_SUBSELECT = """
			select 'TASK' as activity_type, t.id as activity_id, t.owner_id as owner_id, t.contact_id as contact_id,
			t.is_deleted as is_deleted, t.name as subject,
			case when t.is_completed = true then coalesce(t.completed_at, t.created_date)
			when t.due_at is null then t.created_date else t.due_at end as feed_at,
			case when coalesce(t.is_completed, false) = false and t.due_at is not null then true else false end
			as is_due_kind
			from crm_activity_task t
			union all
			select 'CALL', c.id, c.owner_id, c.contact_id, c.is_deleted, c.subject,
			coalesce(c.logged_at, c.created_date), false
			from crm_activity_call c
			union all
			select 'MEETING', m.id, m.owner_id, null, m.is_deleted, m.name, coalesce(m.start_at, m.created_date),
			case when m.is_scheduled = true and m.start_at is not null then true else false end
			from crm_activity_meeting m
			union all
			select 'EMAIL', e.id, e.owner_id, null, e.is_deleted, e.subject, coalesce(e.logged_at, e.created_date),
			false
			from crm_activity_email e
			""";

	@EmbeddedId
	private CrmActivityFeedItemId id;

	@Column(name = "owner_id")
	private Long ownerId;

	@Column(name = "contact_id")
	private Long contactId;

	@Column(name = "is_deleted")
	private Boolean isDeleted;

	@Column(name = "subject")
	private String subject;

	@Column(name = "feed_at")
	private Instant feedAt;

	@Column(name = "is_due_kind")
	private Boolean isDueKind;

}
