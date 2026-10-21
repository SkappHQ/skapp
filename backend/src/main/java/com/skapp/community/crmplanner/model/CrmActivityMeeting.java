package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.crmplanner.type.CrmActivityCalendarProvider;
import com.skapp.community.crmplanner.type.CrmActivityMeetingVenue;
import com.skapp.community.crmplanner.type.CrmActivitySyncStatus;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_activity_meeting")
public class CrmActivityMeeting extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "is_scheduled")
	private Boolean isScheduled = false;

	@Enumerated(EnumType.STRING)
	@Column(name = "meeting_venue")
	private CrmActivityMeetingVenue meetingVenue;

	@Column(name = "location")
	private String location;

	@Column(name = "meeting_date")
	private LocalDate meetingDate;

	@Column(name = "start_at")
	private Instant startAt;

	@Column(name = "end_at")
	private Instant endAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "sync_status")
	private CrmActivitySyncStatus syncStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "calendar_provider")
	private CrmActivityCalendarProvider calendarProvider;

	@Column(name = "comments")
	private String comments;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id")
	private Employee owner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deal_id")
	private CrmDeal deal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_id")
	private CrmCompany company;

	@Column(name = "is_deleted")
	private Boolean isDeleted = false;

}
