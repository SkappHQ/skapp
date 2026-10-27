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
public class CrmActivityCallDetailResponseDto {

	private Long id;

	private String subject;

	private Instant loggedAt;

	private Integer durationMinutes;

	private String comments;

	private Long ownerId;

	private Long contactId;

	private String contactName;

	private Boolean isContactDeleted;

	private Long dealId;

	private String dealName;

	private String dealAmount;

	private Long dealStageId;

	private Long dealOwnerId;

	private Boolean isDealDeleted;

	private Long companyId;

	private String companyName;

	private Boolean isCompanyDeleted;

}
