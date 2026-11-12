package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CrmActivityMeetingEditRequestDto {

	private String name;

	private LocalDate meetingDate;

	private Instant startAt;

	private Instant endAt;

	private List<Long> contactIds;

	private Long dealId;

	private Boolean isDealRemoved;

	private Long companyId;

	private Boolean isCompanyRemoved;

	private Long ownerId;

	private String comments;

}
