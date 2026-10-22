package com.skapp.community.crmplanner.model;

import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.time.Instant;

@Entity
@Immutable
@Getter
@NoArgsConstructor
@Subselect(CrmActivityFeedItem.FEED_SUBSELECT)
@Synchronize({ "crm_activity_task", "crm_activity_call", "crm_activity_meeting", "crm_activity_email" })
public class CrmActivityFeedItem {

	static final String FEED_SUBSELECT = """
			select 'TASK' as activity_type, t.id as activity_id, t.owner_id as owner_id, t.contact_id as contact_id,
			t.deal_id as deal_id, t.company_id as company_id, t.id as task_id,
			case when 1 = 0 then t.id end as call_id, case when 1 = 0 then t.id end as meeting_id,
			case when 1 = 0 then t.id end as email_id, t.is_completed as is_completed, false as is_scheduled,
			t.is_deleted as is_deleted, t.due_at as due_at, t.completed_at as completed_at,
			t.created_date as occurred_at, t.created_date as created_date,
			case when t.is_completed = true then coalesce(t.completed_at, t.created_date)
			when t.due_at is null then t.created_date else t.due_at end as feed_at,
			case when coalesce(t.is_completed, false) = false and t.due_at is not null then true else false end
			as is_due_kind
			from crm_activity_task t
			union all
			select 'CALL', c.id, c.owner_id, c.contact_id, c.deal_id, c.company_id, null, c.id, null, null, false,
			false, c.is_deleted, null, null, c.logged_at, c.created_date, coalesce(c.logged_at, c.created_date), false
			from crm_activity_call c
			union all
			select 'MEETING', m.id, m.owner_id, null, m.deal_id, m.company_id, null, null, m.id, null, false,
			coalesce(m.is_scheduled, false), m.is_deleted, null, null, m.start_at, m.created_date,
			coalesce(m.start_at, m.created_date),
			case when m.is_scheduled = true and m.start_at is not null then true else false end
			from crm_activity_meeting m
			union all
			select 'EMAIL', e.id, e.owner_id, null, e.deal_id, e.company_id, null, null, null, e.id, false, false,
			e.is_deleted, null, null, e.logged_at, e.created_date, coalesce(e.logged_at, e.created_date), false
			from crm_activity_email e
			""";

	@EmbeddedId
	private CrmActivityFeedItemId id;

	@Column(name = "owner_id", insertable = false, updatable = false)
	private Long ownerId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id")
	private Employee owner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contact_id")
	private CrmContact contact;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deal_id")
	private CrmDeal deal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_id")
	private CrmCompany company;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "task_id")
	private CrmActivityTask task;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "call_id")
	private CrmActivityCall call;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_id")
	private CrmActivityMeeting meeting;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "email_id")
	private CrmActivityEmail email;

	@Column(name = "is_completed")
	private Boolean isCompleted;

	@Column(name = "is_scheduled")
	private Boolean isScheduled;

	@Column(name = "is_deleted")
	private Boolean isDeleted;

	@Column(name = "due_at")
	private Instant dueAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Column(name = "occurred_at")
	private Instant occurredAt;

	@Column(name = "created_date")
	private Instant createdDate;

	@Column(name = "feed_at")
	private Instant feedAt;

	@Column(name = "is_due_kind")
	private Boolean isDueKind;

}
