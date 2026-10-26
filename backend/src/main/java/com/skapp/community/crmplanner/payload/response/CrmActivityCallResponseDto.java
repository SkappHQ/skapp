package com.skapp.community.crmplanner.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmActivityCallResponseDto {

	private Long id;

	private String subject;

	private Integer durationMinutes;

	private Instant loggedAt;

	private Long ownerId;

	private Long contactId;

	private Long dealId;

	private Long companyId;

}
