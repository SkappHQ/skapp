package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityCallEditRequestDto {

	private String subject;

	private Instant loggedAt;

	private Integer durationMinutes;

	private Long contactId;

	private Long dealId;

	private Boolean isDealRemoved;

	private Long companyId;

	private Boolean isCompanyRemoved;

	private Long ownerId;

	private String comments;

}
