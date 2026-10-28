package com.skapp.community.crmplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityCallDetailResponseDto {

	private Long id;

	private String subject;

	private Instant loggedAt;

	private Integer durationMinutes;

	private String comments;

	private Long ownerId;

	private CrmActivityCallContactResponseDto contact;

	private CrmActivityCallDealResponseDto deal;

	private CrmActivityCallCompanyResponseDto company;

}
