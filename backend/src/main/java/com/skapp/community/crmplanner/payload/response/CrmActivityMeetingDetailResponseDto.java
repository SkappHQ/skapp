package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CrmActivityMeetingDetailResponseDto {

	private Long id;

	private String name;

	private LocalDate meetingDate;

	private Instant startAt;

	private Instant endAt;

	private String comments;

	private Long ownerId;

	private List<CrmContactLookupResponseDto> contacts;

	private CrmDealResponseDto deal;

	private CrmCompanyLookupResponseDto company;

}
