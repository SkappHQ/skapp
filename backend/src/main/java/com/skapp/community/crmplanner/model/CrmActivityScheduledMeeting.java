package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.crmplanner.type.CrmActivityCalendarProvider;
import com.skapp.community.crmplanner.type.CrmActivityMeetingVenue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_activity_scheduled_meeting")
public class CrmActivityScheduledMeeting extends Auditable<String> {

	@Id
	@Column(name = "meeting_id")
	private Long meetingId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_id")
	private CrmActivityMeeting meeting;

	@Enumerated(EnumType.STRING)
	@Column(name = "meeting_venue")
	private CrmActivityMeetingVenue meetingVenue;

	@Column(name = "location")
	private String location;

	@Column(name = "location_address")
	private String locationAddress;

	@Column(name = "location_url")
	private String locationUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "calendar_provider")
	private CrmActivityCalendarProvider calendarProvider;

	@Column(name = "external_event_id")
	private String externalEventId;

}
