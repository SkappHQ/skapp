package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityCallCreateResponseDto {

	private Long id;

	private String subject;

	private Instant loggedAt;

	private Integer durationMinutes;

	private Long contactId;

	private Long dealId;

	private Long companyId;

	private Long ownerId;

	private String comments;

}
