package com.skapp.community.crmplanner.payload.response;

import com.skapp.community.crmplanner.type.CrmActivityMeetingVenue;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CrmActivityMeetingResponseDto {

	private Long id;

	private String name;

	private Boolean isScheduled;

	private CrmActivityMeetingVenue meetingVenue;

	private String location;

	private Instant startAt;

	private Instant endAt;

	private Long ownerId;

	private Long dealId;

	private Long companyId;

	private List<Long> contactIds = new ArrayList<>();

	public CrmActivityMeetingResponseDto(Long id, String name, Boolean isScheduled,
			CrmActivityMeetingVenue meetingVenue, String location, Instant startAt, Instant endAt, Long ownerId,
			Long dealId, Long companyId) {
		this.id = id;
		this.name = name;
		this.isScheduled = isScheduled;
		this.meetingVenue = meetingVenue;
		this.location = location;
		this.startAt = startAt;
		this.endAt = endAt;
		this.ownerId = ownerId;
		this.dealId = dealId;
		this.companyId = companyId;
	}

}
